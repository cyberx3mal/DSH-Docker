/**
 * Host half of the Docker right-sidebar bundle.
 *
 * This is the only privileged part of the feature. It runs the `docker` CLI on
 * the machine that hosts the Harness and exposes the result to the browser half
 * through one generic Connection RPC channel (`/dsh-docker`), which the Web and
 * Desktop shells both carry. Every command is an argument array (no shell),
 * container ids and project names are validated against the state this process
 * just read, and nothing runs without a request.
 *
 * A read-only diagnostics route (`/dsh-docker-diag`) exposes the browser half's
 * lifecycle reports to the local operator; it accepts loopback same-origin
 * requests only.
 */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

/** Version of this installed bundle, shown by the browser half so two machines can be compared. */
const PLUGIN_VERSION = (() => {
  try {
    const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
    return typeof manifest.version === 'string' ? manifest.version : '0.0.0'
  } catch {
    return '0.0.0'
  }
})()

const DIAG_PATH = '/dsh-docker-diag'
const COMMAND_TIMEOUT_MS = 20000
const STATE_TTL_MS = 1000
const MAX_BODY_BYTES = 64 * 1024
const MAX_MESSAGE_CHARS = 400
const MAX_LOG_CHARS = 120000
const DIAGNOSTIC_LIMIT = 20
const CONTAINER_ID = /^[0-9a-f]{12,64}$/i
const PROJECT_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/

/** Services this half needs; without the Web carrier and Connection it stays inactive. */
export const inject = ['webServer', 'connection']

/** Last reported browser-half lifecycle events, kept in memory for diagnostics. */
const diagnostics = []

/**
 * Record one browser-half lifecycle event.
 * @param event - event name.
 * @param detail - optional detail text.
 * @returns nothing.
 */
function recordDiagnostic(event, detail) {
  diagnostics.push({ event, detail: clip(detail, MAX_MESSAGE_CHARS), at: Date.now() })
  if (diagnostics.length > DIAGNOSTIC_LIMIT) diagnostics.splice(0, diagnostics.length - DIAGNOSTIC_LIMIT)
}

/**
 * Run one docker CLI call and capture its output.
 * @param {string[]} args - command arguments after `docker`, never shell-split.
 * @param {{ timeoutMs?: number }} [options] - per-call deadline.
 * @returns {Promise<{ ok: boolean, code: number|null, stdout: string, stderr: string, failure?: string }>}
 */
function runDocker(args, options = {}) {
  const timeoutMs = options.timeoutMs ?? COMMAND_TIMEOUT_MS
  return new Promise(resolve => {
    let child
    try {
      child = spawn('docker', args, { windowsHide: true, env: process.env })
    } catch (error) {
      resolve({
        ok: false,
        code: null,
        stdout: '',
        stderr: '',
        errorCode: error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined,
        failure: `docker не запускается: ${error instanceof Error ? error.message : String(error)}`,
      })
      return
    }

    let stdout = ''
    let stderr = ''
    let timedOut = false
    let settled = false
    let errorCode

    const finish = code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: code === 0 && !timedOut, code, stdout, stderr, errorCode })
    }
    const kill = () => {
      try {
        child.kill('SIGKILL')
      } catch {
        /* the process may already be gone */
      }
    }
    const timer = setTimeout(() => {
      timedOut = true
      kill()
    }, timeoutMs)
    if (timer !== undefined && typeof timer.unref === 'function') timer.unref()

    child.stdout?.on('data', chunk => {
      stdout += String(chunk)
      if (stdout.length > 4_000_000) stdout = stdout.slice(-3_000_000)
    })
    child.stderr?.on('data', chunk => {
      stderr += String(chunk)
      if (stderr.length > 400_000) stderr = stderr.slice(-300_000)
    })
    child.on('error', error => {
      errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined
      stderr += `\nspawn error: ${error.message}`
      finish(null)
    })
    child.on('close', code => finish(code))
  })
}

/** Cut a text to `max` characters so a hostile daemon cannot flood a response. */
function clip(text, max) {
  const value = typeof text === 'string' ? text : String(text ?? '')
  return value.length > max ? value.slice(0, max) : value
}

/** First non-empty line of a text, for compact error copy. */
function firstLine(text) {
  const lines = clip(text, 2000)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '')
  return lines.length > 0 ? lines[0] : ''
}

/** JSON lines output of `--format '{{json .}}'`, one value per line. */
function parseJsonLines(text) {
  const out = []
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '' || !trimmed.startsWith('{')) continue
    try {
      out.push(JSON.parse(trimmed))
    } catch {
      /* a daemon warning printed on stdout is not a row */
    }
  }
  return out
}

/** Docker label string `k=v,k2=v2` as an object. */
function parseLabels(text) {
  const out = {}
  if (typeof text !== 'string' || text === '') return out
  for (const part of text.split(',')) {
    const at = part.indexOf('=')
    if (at <= 0) continue
    out[part.slice(0, at)] = part.slice(at + 1)
  }
  return out
}

/** Exit code of a stopped container, parsed from its status text, or null. */
function exitCodeOf(status) {
  const match = /Exited \((\d+)\)/i.exec(status)
  return match === null ? null : Number(match[1])
}

/** Epoch milliseconds of the newest log line, parsed from `docker logs --timestamps`. */
function lastLogAt(text) {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
  if (lines.length === 0) return null
  const token = lines[lines.length - 1].trim().split(/\s+/)[0]
  const at = Date.parse(token.replace(/(\.\d{3})\d+/, '$1'))
  return Number.isNaN(at) ? null : at
}

/** One `docker ps` row as the compact record the panel uses. */
function toContainer(row) {
  const labels = parseLabels(row.Labels)
  const status = String(row.Status ?? '')
  return {
    id: String(row.ID ?? ''),
    name: String(row.Names ?? ''),
    image: String(row.Image ?? ''),
    state: String(row.State ?? ''),
    status,
    exitCode: exitCodeOf(status),
    ports: clip(String(row.Ports ?? ''), 160),
    created: String(row.RunningFor ?? ''),
    service: String(labels['com.docker.compose.service'] ?? ''),
    project: String(labels['com.docker.compose.project'] ?? ''),
    workingDir: String(labels['com.docker.compose.project.working_dir'] ?? ''),
    configFile: String(labels['com.docker.compose.project.config_files'] ?? ''),
  }
}

/** Sort containers: running first, then by name. */
function sortContainers(left, right) {
  const leftRunning = left.state === 'running' ? 0 : 1
  const rightRunning = right.state === 'running' ? 0 : 1
  if (leftRunning !== rightRunning) return leftRunning - rightRunning
  return left.name.localeCompare(right.name)
}

/** Fold the flat container list into compose projects plus standalone containers. */
function buildState(engine, containers) {
  const groups = new Map()
  const standalone = []
  for (const container of containers) {
    if (container.project === '') {
      standalone.push(container)
      continue
    }
    let group = groups.get(container.project)
    if (group === undefined) {
      group = {
        id: container.project,
        name: container.project,
        workingDir: container.workingDir,
        configFile: container.configFile,
        containers: [],
      }
      groups.set(container.project, group)
    }
    group.containers.push(container)
  }

  const projects = [...groups.values()].map(group => {
    group.containers.sort(sortContainers)
    const running = group.containers.filter(container => container.state === 'running').length
    return { ...group, running, total: group.containers.length }
  })
  projects.sort((left, right) => {
    if (left.running !== right.running) return right.running - left.running
    return left.name.localeCompare(right.name)
  })
  standalone.sort(sortContainers)

  const totalRunning = containers.filter(container => container.state === 'running').length
  return {
    ok: true,
    version: PLUGIN_VERSION,
    engine,
    projects,
    standalone,
    totals: {
      containers: containers.length,
      running: totalRunning,
      projects: projects.length,
      runningProjects: projects.filter(project => project.running > 0).length,
    },
    updatedAt: Date.now(),
  }
}

/** Version facts of a healthy engine from `docker version --format '{{json .}}'`. */
function parseVersion(text) {
  try {
    const parsed = JSON.parse(clip(text, 200_000).trim())
    const client = parsed.Client ?? {}
    const server = parsed.Server ?? {}
    return {
      running: true,
      clientVersion: String(client.Version ?? ''),
      serverVersion: String(server.Version ?? ''),
      os: String(server.Os ?? ''),
      arch: String(server.Arch ?? ''),
    }
  } catch {
    return { running: true, clientVersion: '', serverVersion: '', os: '', arch: '' }
  }
}

/** Empty state for an unreachable engine; `cli` tells a missing CLI apart from a dead daemon. */
function unavailableState(message, cli = true) {
  return {
    ok: false,
    version: PLUGIN_VERSION,
    engine: { running: false, cli },
    error: message,
    projects: [],
    standalone: [],
    totals: { containers: 0, running: 0, projects: 0, runningProjects: 0 },
    updatedAt: Date.now(),
  }
}

/** OOM flags of the given containers, so a killed stop is told apart from a crash. */
async function collectOomFlags(ids) {
  const flags = new Map()
  if (ids.length === 0) return flags
  const inspected = await runDocker(['inspect', '--format', '{{.Id}} {{.State.OOMKilled}}', ...ids], { timeoutMs: 15000 })
  if (!inspected.ok) return flags
  for (const line of inspected.stdout.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 2) continue
    flags.set(parts[0], parts[1] === 'true')
  }
  return flags
}

/** Read the whole Docker state from the CLI. */
async function collectState() {
  const version = await runDocker(['version', '--format', '{{json .}}'])
  if (!version.ok) {
    const cliMissing = version.errorCode === 'ENOENT'
    return unavailableState(
      cliMissing
        ? 'Docker CLI не найден: команда docker недоступна процессу Harness.'
        : firstLine(version.stderr) || version.failure || 'Docker недоступен: демон не отвечает.',
      !cliMissing,
    )
  }
  const engine = parseVersion(version.stdout)
  const listed = await runDocker(['ps', '-a', '--no-trunc', '--format', '{{json .}}'])
  if (!listed.ok) {
    return unavailableState(firstLine(listed.stderr) || 'Не удалось прочитать список контейнеров.')
  }
  const containers = parseJsonLines(listed.stdout).map(toContainer)
  const oom = await collectOomFlags(containers.map(container => container.id).filter(id => CONTAINER_ID.test(id)))
  for (const container of containers) container.oomKilled = oom.get(container.id) === true
  return buildState(engine, containers)
}

/** Error text of a thrown value. */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

/** Largest preferences document the Host accepts, in bytes of JSON. */
const PREFS_MAX_BYTES = 16 * 1024

/** Path of the profile-level preferences document shared by every browser. */
function prefsFile() {
  const home =
    typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
      ? process.env.DSH_HOME
      : path.join(homedir(), '.dsh')
  return path.join(home, 'storages', 'docker-sidebar', 'prefs.json')
}

/** Read the stored preferences; a missing or broken file reads as empty. */
async function readPrefs() {
  try {
    const text = await readFile(prefsFile(), 'utf8')
    const parsed = JSON.parse(text)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/** Replace the stored preferences atomically. */
async function writePrefs(prefs) {
  const file = prefsFile()
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.tmp`
  await writeFile(temp, JSON.stringify(prefs, null, 2), 'utf8')
  await rename(temp, file)
}

/**
 * Create the cached state reader and the action executor bound to one plugin context.
 * @returns {{ readState: (force?: boolean) => Promise<object>, performAction: (request: object) => Promise<object> }}
 */
function createDockerAccess() {
  let cache = null
  let cacheAt = 0
  let pending = null

  const readState = async force => {
    const now = Date.now()
    if (force !== true && cache !== null && now - cacheAt < STATE_TTL_MS) return cache
    if (pending !== null) return pending
    pending = collectState()
      .then(state => {
        cache = state
        cacheAt = Date.now()
        return state
      })
      .finally(() => {
        pending = null
      })
    return pending
  }

  const startContainers = async ids => {
    if (ids.length === 0) return { ok: true, message: 'Нет контейнеров для запуска.' }
    const results = await Promise.all(ids.map(id => runDocker(['start', id])))
    const failure = results.find(result => !result.ok)
    return failure === undefined
      ? { ok: true }
      : { ok: false, error: firstLine(failure.stderr) || 'Docker не смог запустить контейнеры.' }
  }

  /**
   * Stop one container. A container in a restart loop refuses a plain `stop`, so its restart
   * policy is dropped for the moment of the stop and restored afterwards.
   * @param {string} id - container id.
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  const stopOne = async id => {
    const stopped = await runDocker(['stop', id], { timeoutMs: 30000 })
    if (stopped.ok) return { ok: true }
    const reason = firstLine(stopped.stderr) || firstLine(stopped.stdout)
    if (!/restart/i.test(reason)) {
      return { ok: false, error: reason || 'Docker не смог остановить контейнер.' }
    }
    const policy = await runDocker(['inspect', '--format', '{{.HostConfig.RestartPolicy.Name}}', id], { timeoutMs: 10000 })
    const previous = policy.ok ? firstLine(policy.stdout) : ''
    await runDocker(['update', '--restart=no', id], { timeoutMs: 15000 })
    const retry = await runDocker(['stop', id], { timeoutMs: 30000 })
    if (previous !== '' && previous !== 'no') {
      await runDocker(['update', `--restart=${previous}`, id], { timeoutMs: 15000 })
    }
    return retry.ok ? { ok: true } : { ok: false, error: firstLine(retry.stderr) || 'Docker не смог остановить контейнер.' }
  }

  const stopContainers = async ids => {
    if (ids.length === 0) return { ok: true, message: 'Все контейнеры уже остановлены.' }
    const results = await Promise.all(ids.map(id => stopOne(id)))
    const failure = results.find(result => !result.ok)
    return failure === undefined ? { ok: true } : failure
  }

  const restartContainers = async ids => {
    if (ids.length === 0) return { ok: true, message: 'Нет контейнеров для перезапуска.' }
    const results = await Promise.all(ids.map(id => runDocker(['restart', id])))
    const failure = results.find(result => !result.ok)
    return failure === undefined
      ? { ok: true }
      : { ok: false, error: firstLine(failure.stderr) || 'Docker не смог перезапустить контейнеры.' }
  }

  const logsOf = async (id, tail) => {
    const lines = Number.isInteger(tail) && tail >= 50 && tail <= 5000 ? tail : 200
    const result = await runDocker(['logs', '--tail', String(lines), id], { timeoutMs: 30000 })
    const text = clip(`${result.stdout}${result.stderr}`.trim(), MAX_LOG_CHARS)
    if (!result.ok && text === '') {
      return { ok: false, error: firstLine(result.stderr) || 'Не удалось прочитать логи.' }
    }
    return { ok: true, logs: { id, text } }
  }

  const projectContainers = async project => {
    const state = await readState(true)
    const group = state.projects.find(item => item.id === project)
    return group === undefined ? undefined : group.containers
  }

  const performAction = async request => {
    const action = typeof request?.action === 'string' ? request.action : ''
    const target = request?.target ?? {}

    if (action === 'refresh') return { ok: true, state: await readState(true) }

    if (action === 'prefs.get') return { ok: true, prefs: await readPrefs() }

    if (action === 'prefs.set') {
      const prefs = target !== null && typeof target === 'object' ? target.prefs : undefined
      if (prefs === null || typeof prefs !== 'object' || Array.isArray(prefs)) {
        return { ok: false, error: 'Неверный формат настроек.' }
      }
      const text = JSON.stringify(prefs)
      if (text.length > PREFS_MAX_BYTES) return { ok: false, error: 'Настройки слишком велики.' }
      try {
        await writePrefs(prefs)
        return { ok: true, prefs }
      } catch (error) {
        return { ok: false, error: `Не удалось сохранить настройки: ${messageOf(error)}` }
      }
    }

    if (action === 'logs.lastAt') {
      const ids = Array.isArray(target.ids)
        ? target.ids.filter(id => typeof id === 'string' && CONTAINER_ID.test(id)).slice(0, 50)
        : []
      const seen = {}
      await Promise.all(
        ids.map(async id => {
          const result = await runDocker(['logs', '--timestamps', '--tail', '1', id], { timeoutMs: 10000 })
          const text = `${result.stdout}${result.stderr}`
          seen[id] = text.trim() === '' ? null : lastLogAt(text)
        }),
      )
      return { ok: true, seen }
    }

    if (action === 'container.logs') {
      const id = typeof target.id === 'string' ? target.id : ''
      if (!CONTAINER_ID.test(id)) return { ok: false, error: 'Неверный идентификатор контейнера.' }
      return logsOf(id, typeof target.tail === 'number' ? target.tail : undefined)
    }

    if (action === 'all.start' || action === 'all.stop' || action === 'all.restart') {
      const state = await readState(true)
      const containers = state.projects
        .flatMap(project => project.containers)
        .concat(state.standalone)
      const ids = containers.map(container => container.id).filter(id => CONTAINER_ID.test(id))
      const running = containers
        .filter(container => container.state === 'running' || container.state === 'restarting')
        .map(container => container.id)
      const startable = containers
        .filter(container => container.state === 'exited' || container.state === 'created' || container.state === 'dead')
        .map(container => container.id)
      const result =
        action === 'all.start'
          ? await startContainers(startable)
          : action === 'all.stop'
            ? await stopContainers(running)
            : await restartContainers(ids)
      if (!result.ok) return result
      return { ok: true, state: await readState(true) }
    }

    if (action.startsWith('container.')) {
      const id = typeof target.id === 'string' ? target.id : ''
      if (!CONTAINER_ID.test(id)) return { ok: false, error: 'Неверный идентификатор контейнера.' }
      const verb = action.slice('container.'.length)
      const result =
        verb === 'start'
          ? await startContainers([id])
          : verb === 'stop'
            ? await stopContainers([id])
            : verb === 'restart'
              ? await restartContainers([id])
              : { ok: false, error: `Неизвестное действие "${verb}".` }
      if (!result.ok) return result
      return { ok: true, state: await readState(true) }
    }

    if (action.startsWith('project.')) {
      const project = typeof target.project === 'string' ? target.project : ''
      if (!PROJECT_NAME.test(project)) return { ok: false, error: 'Неверное имя проекта.' }
      const verb = action.slice('project.'.length)
      const containers = await projectContainers(project)
      if (containers === undefined) return { ok: false, error: 'Проект не найден.' }
      const ids = containers.map(container => container.id).filter(id => CONTAINER_ID.test(id))
      const running = containers.filter(container => container.state === 'running').map(container => container.id)
      const active = containers
        .filter(container => container.state === 'running' || container.state === 'restarting')
        .map(container => container.id)
      const result =
        verb === 'start'
          ? await startContainers(ids.filter(id => !running.includes(id)))
          : verb === 'stop'
            ? await stopContainers(active)
            : verb === 'restart'
              ? await restartContainers(ids)
              : { ok: false, error: `Неизвестное действие "${verb}".` }
      if (!result.ok) return result
      return { ok: true, state: await readState(true) }
    }

    return { ok: false, error: 'Неизвестное действие.' }
  }

  return { readState, performAction }
}

/** One JSON response for an exact Fetch route. */
function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

/**
 * Register the Docker state, action and diagnostics Fetch routes under `/api`,
 * plus the read-only diagnostics HTTP route for the local operator, for the
 * life of the plugin.
 * @param {object} ctx - Host plugin context.
 */
export function apply(ctx) {
  const access = createDockerAccess()

  const registerRoute = (path, methods, fetch) =>
    ctx.effect(
      () => ctx.connection.fetch.register({ path, methods, requestBody: 'buffered', fetch }),
      `docker-sidebar: ${path}`,
    )

  registerRoute('/api/dsh-docker/state', ['GET'], async () => jsonResponse(200, await access.readState(false)))

  registerRoute('/api/dsh-docker/action', ['POST'], async request => {
    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse(400, { ok: false, error: 'Тело запроса не является JSON.' })
    }
    return jsonResponse(200, await access.performAction(body))
  })

  registerRoute('/api/dsh-docker/diag', ['GET', 'POST'], async request => {
    if (request.method === 'POST') {
      try {
        const report = await request.json()
        recordDiagnostic(
          typeof report?.event === 'string' ? report.event : 'unknown',
          typeof report?.detail === 'string' ? report.detail : '',
        )
      } catch {
        return jsonResponse(400, { ok: false, error: 'Тело запроса не является JSON.' })
      }
      return jsonResponse(200, { ok: true })
    }
    return jsonResponse(200, { ok: true, diagnostics: [...diagnostics] })
  })

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: DIAG_PATH,
        handler: (req, res) => {
          const refusal = guardRequest(ctx, req)
          if (refusal !== undefined) {
            send(res, 403, { ok: false, error: refusal })
            return
          }
          const method = req.method ?? 'GET'
          if (method === 'GET' || method === 'HEAD') {
            send(res, 200, { ok: true, diagnostics: [...diagnostics] })
            return
          }
          if (method !== 'POST') {
            send(res, 405, { ok: false, error: 'Метод не поддерживается.' })
            return
          }
          readJsonBody(req).then(
            report => {
              recordDiagnostic(
                typeof report?.event === 'string' ? report.event : 'unknown',
                typeof report?.detail === 'string' ? report.detail : '',
              )
              send(res, 200, { ok: true })
            },
            error => send(res, 400, { ok: false, error: messageOf(error) }),
          )
        },
      }),
    'docker-sidebar: diagnostics route',
  )
}

function guardRequest(ctx, req) {
  const remote = req.socket?.remoteAddress ?? ''
  const loopback =
    remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1' || remote === ''
  if (!loopback) return 'Запросы принимаются только с этого компьютера.'

  let origin
  try {
    const webApp = typeof ctx.get === 'function' ? ctx.get('webApp') : undefined
    const advertised = webApp?.getAdvertisedUrl?.()
    origin = advertised !== undefined && advertised !== '' ? new URL(advertised) : new URL(ctx.webServer.getOrigin())
  } catch {
    origin = undefined
  }
  if (origin === undefined) return undefined

  const host = typeof req.headers.host === 'string' ? req.headers.host.toLowerCase() : ''
  if (host !== '' && host !== origin.host.toLowerCase()) return 'Неверный заголовок Host.'
  const site = req.headers['sec-fetch-site']
  if (typeof site === 'string' && site.toLowerCase() === 'cross-site') return 'Межсайтовый запрос запрещён.'
  const requestOrigin = req.headers.origin
  if (typeof requestOrigin === 'string' && requestOrigin !== '' && requestOrigin !== origin.origin) {
    return 'Неверный источник запроса.'
  }
  return undefined
}

/** Send one JSON response on the diagnostics route. */
function send(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

/** Read a bounded JSON request body. */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', chunk => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Тело запроса слишком велико.'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('error', error => reject(error))
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8')
      if (text.trim() === '') {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(text))
      } catch {
        reject(new Error('Тело запроса не является JSON.'))
      }
    })
  })
}

