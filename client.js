/**
 * Browser half of the Docker right-sidebar bundle.
 *
 * Registers one right-Sidebar tab type (`docker`) with its guide card, chip
 * title and body. The body reads the Host route `/dsh-docker/state` on a slow
 * poll while it is visible and posts explicit user actions to
 * `/dsh-docker/action`; nothing runs without a click.
 */
window.__ModuleLoader__.load({
  id: '@local/docker-sidebar',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NAMESPACE = 'dockerSidebar'
    const API_BASE = 'api/dsh-docker'
    const DIAG_PATH = '/dsh-docker-diag'
    const PANEL_ID = 'docker'
    const POLL_MS = 5000
    const POLL_IDLE_MS = 20000

    /* ------------------------------------------------------------------ *
     * Copy
     * ------------------------------------------------------------------ */

    const dictionaries = {
      en: {
        panel: 'Docker',
        tabTitle: 'Docker',
        description: 'Container state and quick controls',
        pageSubtitle: 'Docker engine state, compose projects and quick container controls.',
        collapseAll: 'Collapse all',
        expandAll: 'Expand all',
        openPanel: 'Open panel',
        expand: 'Expand list',
        collapse: 'Collapse list',
        'engine.version': 'Docker {version}',
        'engine.running': 'Docker is running',
        'engine.down': 'Docker is not running',
        diagnostic: 'Channel',
        refresh: 'Refresh',
        loading: 'Reading Docker state…',
        retry: 'Retry',
        'error.title': 'Docker state is unavailable',
        'error.action': 'Action failed: {message}',
        dismiss: 'Dismiss',
        projects: 'Projects',
        standalone: 'Standalone containers',
        start: 'Start',
        stop: 'Stop',
        restart: 'Restart',
        startAll: 'Start all containers',
        stopAll: 'Stop all containers',
        confirmStopAll: 'Click again to stop every container',
        pinProject: 'Pin project',
        unpinProject: 'Unpin project',
        'settings.now': 'Now: {projects} projects · {running} of {containers} containers running · {standalone} standalone · {crashed} crashed',
        'settings.nowUnknown': 'Waiting for the first Docker reading…',
        'settings.env': 'Docker environment',
        'settings.envCli': 'Docker CLI',
        'settings.envDaemon': 'Daemon',
        'settings.envUnknown': 'unknown',
        'settings.envFound': 'found',
        'settings.envMissing': 'not found',
        'settings.envUp': 'running',
        'settings.envDown': 'not responding',
        'settings.envVersion': 'version {version}',
        'settings.build': 'Plugin version {version}',
        'settings.profile': 'Preferences are shared through the profile and apply to every browser.',
        'settings.profileLocal': 'Preferences are stored only in this browser: the profile document is unavailable.',
        'settings.profileLoading': 'Reading profile preferences…',
        'env.cliMissing': 'Docker CLI is not available to the Harness process. Install Docker and put `docker` on PATH.',
        'env.daemonDown': 'The Docker daemon is not responding. Start Docker Desktop or the Docker service.',
        'here': 'here',
        'crashRowHint': 'Container crashed — click to dismiss this highlight.',
        'settings.standaloneNow': 'Currently: {count}.',
        'settings.sort': 'Sorting',
        'sortHint': 'Sorting: {mode}. Click to switch.',
        'settings.sortHint': 'Order of the project list and of containers inside it.',
        'settings.sort.status': 'By status',
        'settings.sort.name': 'By name',
        'settings.sort.project': 'By project',
        'settings.hideStopped': 'Hide stopped projects',
        'settings.hideStoppedHint': 'Projects without running containers and without crashes are left out of the list.',
        'settings.hideEmpty': 'Hide empty widget',
        'settings.hideEmptyHint': 'Hide the strip completely while there are no containers.',
        'settings.density': 'Density',
        'settings.densityHint': 'Row padding inside the widget.',
        'settings.density.compact': 'Compact',
        'settings.density.normal': 'Normal',
        'settings.density.wide': 'Wide',
        'settings.fontSize': 'Font size',
        'settings.fontSizeHint': 'Text size of project and container rows.',
        'settings.detailed': 'Detailed rows',
        'settings.detailedHint': 'Add a second line with the image and published ports.',
        'settings.hung': 'Stalled container threshold',
        'settings.hungHint': 'Mark a running container yellow when it produced no new log lines for this long. Off disables the check.',
        'settings.crashSound': 'Sound on crash',
        'settings.crashSoundHint': 'Played when a running container dies. Pick a sound and press the speaker to hear it.',
        'error.restarting': 'The container is restarting and refused the stop. Try again — the widget drops its restart policy for the moment of the stop.',
        'error.notRunning': 'The container is not running.',
        'error.permission': 'Docker refused the action: permission denied.',
        'error.daemon': 'The Docker daemon is not responding.',
        'error.missing': 'The container no longer exists.',
        'settings.preview': 'Play this sound',
        'settings.sound.off': 'Off',
        'settings.sound.twoTone': 'Two-tone',
        'settings.sound.chime': 'Chime',
        'settings.sound.alarm': 'Alarm',
        'settings.sound.ping': 'Ping',
        'settings.minutes': '{value} min',
        'settings.nav': 'Docker',
        'settings.title': 'Docker widget',
        'settings.subtitle': 'How the Docker strip in the sidebar looks and refreshes.',
        'settings.language': 'Language',
        'settings.languageHint': 'Language of the widget interface. Auto follows the Harness language.',
        'settings.language.auto': 'Auto',
        'settings.poll': 'Refresh interval',
        'settings.pollHint': 'How often the widget rereads container state. Off keeps the last reading until manual refresh.',
        'settings.off': 'Off',
        'settings.seconds': '{value} s',
        'settings.counters': 'Container counter',
        'settings.countersHint': 'Show running/total containers next to the name.',
        'settings.projectCount': 'Project counter',
        'settings.projectCountHint': 'Show "running of total" in a project row.',
        'settings.uptime': 'Container uptime',
        'settings.uptimeHint': 'Show the running time in parentheses after the container name.',
        'settings.allButtons': 'Start all and stop all',
        'settings.allButtonsHint': 'Show the two global buttons left of the refresh button.',
        'settings.standalone': 'Standalone containers',
        'settings.standaloneHint': 'List containers that do not belong to a compose project.',
        'settings.confirmStopAll': 'Confirm "stop all"',
        'settings.confirmStopAllHint': 'Require a second click before stopping every container.',
        'settings.consoleLines': 'Console log lines',
        'settings.consoleLinesHint': 'How many log lines the console window requests.',
        'settings.reset': 'Reset to defaults',
        logs: 'Show logs',
        hideLogs: 'Hide logs',
        loadingLogs: 'Reading output…',
        logsEmpty: 'No output.',
        console: 'Console',
        logsError: 'Could not read the container logs.',
        'project.count': '{running} of {total} running',
        'totals.containers': '{running} running · {total} total',
        'totals.projects': 'Projects: {count}',
        updated: 'Updated {time}',
        empty: 'No containers yet.',
        'state.running': 'running',
        'state.exited': 'stopped',
        'state.paused': 'paused',
        'state.restarting': 'restarting',
        'state.created': 'created',
        'state.dead': 'dead',
      },
      ru: {
        panel: 'Docker',
        tabTitle: 'Docker',
        description: 'Состояние контейнеров и быстрое управление',
        pageSubtitle: 'Состояние Docker, compose-проекты и быстрые действия с контейнерами.',
        collapseAll: 'Свернуть всё',
        expandAll: 'Развернуть всё',
        openPanel: 'Открыть панель',
        expand: 'Развернуть список',
        collapse: 'Свернуть список',
        'engine.version': 'Docker {version}',
        'engine.running': 'Docker работает',
        'engine.down': 'Docker не запущен',
        diagnostic: 'Канал',
        refresh: 'Обновить',
        loading: 'Читаю состояние Docker…',
        retry: 'Повторить',
        'error.title': 'Не удалось прочитать состояние Docker',
        'error.action': 'Действие не удалось: {message}',
        dismiss: 'Закрыть',
        projects: 'Проекты',
        standalone: 'Отдельные контейнеры',
        start: 'Запустить',
        stop: 'Остановить',
        restart: 'Перезапустить',
        startAll: 'Запустить все контейнеры',
        stopAll: 'Остановить все контейнеры',
        confirmStopAll: 'Нажмите ещё раз, чтобы остановить все контейнеры',
        pinProject: 'Закрепить проект',
        unpinProject: 'Открепить проект',
        'settings.now': 'Сейчас: проектов {projects} · работает {running} из {containers} контейнеров · отдельных {standalone} · упало {crashed}',
        'settings.nowUnknown': 'Жду первого чтения Docker…',
        'settings.env': 'Окружение Docker',
        'settings.envCli': 'Docker CLI',
        'settings.envDaemon': 'Демон',
        'settings.envUnknown': 'неизвестно',
        'settings.envFound': 'найден',
        'settings.envMissing': 'не найден',
        'settings.envUp': 'работает',
        'settings.envDown': 'не отвечает',
        'settings.envVersion': 'версия {version}',
        'settings.build': 'Версия плагина {version}',
        'settings.profile': 'Настройки хранятся в профиле и действуют во всех браузерах.',
        'settings.profileLocal': 'Настройки хранятся только в этом браузере: документ профиля недоступен.',
        'settings.profileLoading': 'Читаю настройки профиля…',
        'env.cliMissing': 'Docker CLI недоступен процессу Harness. Установите Docker и добавьте `docker` в PATH.',
        'env.daemonDown': 'Docker-демон не отвечает. Запустите Docker Desktop или службу docker.',
        'here': 'здесь',
        'crashRowHint': 'Контейнер упал — нажмите, чтобы убрать подсветку.',
        'settings.standaloneNow': 'Сейчас: {count}.',
        'settings.sort': 'Сортировка',
        'sortHint': 'Сортировка: {mode}. Нажмите, чтобы сменить.',
        'settings.sortHint': 'Порядок списка проектов и контейнеров внутри проекта.',
        'settings.sort.status': 'По статусу',
        'settings.sort.name': 'По имени',
        'settings.sort.project': 'По проекту',
        'settings.hideStopped': 'Скрывать остановленные проекты',
        'settings.hideStoppedHint': 'Проекты без запущенных контейнеров и без падений не показываются в списке.',
        'settings.hideEmpty': 'Скрывать пустой виджет',
        'settings.hideEmptyHint': 'Полностью скрывать полоску, пока контейнеров нет.',
        'settings.density': 'Плотность',
        'settings.densityHint': 'Отступы строк внутри виджета.',
        'settings.density.compact': 'Компактно',
        'settings.density.normal': 'Обычно',
        'settings.density.wide': 'Свободно',
        'settings.fontSize': 'Размер шрифта',
        'settings.fontSizeHint': 'Размер текста в строках проектов и контейнеров.',
        'settings.detailed': 'Подробные строки',
        'settings.detailedHint': 'Добавлять вторую строку с образом и опубликованными портами.',
        'settings.hung': 'Порог «зависшего» контейнера',
        'settings.hungHint': 'Помечать работающий контейнер жёлтым, если новых строк логов нет дольше этого времени. «Выкл» отключает проверку.',
        'settings.crashSound': 'Звук при падении',
        'settings.crashSoundHint': 'Играет, когда работающий контейнер упал. Выберите звук и нажмите на динамик, чтобы услышать.',
        'error.restarting': 'Контейнер в цикле перезапуска и отказал в остановке. Повторите — виджет на время снимет политику перезапуска.',
        'error.notRunning': 'Контейнер не запущен.',
        'error.permission': 'Docker отклонил действие: недостаточно прав.',
        'error.daemon': 'Docker-демон не отвечает.',
        'error.missing': 'Контейнера больше нет.',
        'settings.preview': 'Прослушать звук',
        'settings.sound.off': 'Выкл',
        'settings.sound.twoTone': 'Два тона',
        'settings.sound.chime': 'Перезвон',
        'settings.sound.alarm': 'Сирена',
        'settings.sound.ping': 'Пинг',
        'settings.minutes': '{value} мин',
        'settings.nav': 'Docker',
        'settings.title': 'Виджет Docker',
        'settings.subtitle': 'Как выглядит и обновляется полоска Docker в боковой панели.',
        'settings.language': 'Язык',
        'settings.languageHint': 'Язык интерфейса виджета. «Авто» — как в Harness.',
        'settings.language.auto': 'Авто',
        'settings.poll': 'Интервал обновления',
        'settings.pollHint': 'Как часто виджет перечитывает состояние контейнеров. «Выкл» оставляет последние данные до ручного обновления.',
        'settings.off': 'Выкл',
        'settings.seconds': '{value} с',
        'settings.counters': 'Счётчик контейнеров',
        'settings.countersHint': 'Показывать «запущено/всего» рядом с названием.',
        'settings.projectCount': 'Счётчик в проекте',
        'settings.projectCountHint': 'Показывать «запущено из всего» в строке проекта.',
        'settings.uptime': 'Время работы контейнера',
        'settings.uptimeHint': 'Показывать время работы в скобках после названия контейнера.',
        'settings.allButtons': 'Кнопки «запустить все» и «остановить все»',
        'settings.allButtonsHint': 'Показывать две общие кнопки левее кнопки обновления.',
        'settings.standalone': 'Отдельные контейнеры',
        'settings.standaloneHint': 'Показывать контейнеры вне compose-проектов.',
        'settings.confirmStopAll': 'Подтверждать «остановить все»',
        'settings.confirmStopAllHint': 'Требовать второе нажатие перед остановкой всех контейнеров.',
        'settings.consoleLines': 'Строк логов в консоли',
        'settings.consoleLinesHint': 'Сколько строк запрашивает окно консоли.',
        'settings.reset': 'Сбросить настройки',
        logs: 'Показать логи',
        hideLogs: 'Скрыть логи',
        loadingLogs: 'Читаю вывод…',
        logsEmpty: 'Вывода нет.',
        console: 'Консоль',
        logsError: 'Не удалось прочитать логи контейнера.',
        'project.count': 'запущено {running} из {total}',
        'totals.containers': 'работает {running} · всего {total}',
        'totals.projects': 'Проектов: {count}',
        updated: 'Обновлено {time}',
        empty: 'Контейнеров пока нет.',
        'state.running': 'работает',
        'state.exited': 'остановлен',
        'state.paused': 'на паузе',
        'state.restarting': 'перезапускается',
        'state.created': 'создан',
        'state.dead': 'упал',
      },
    }

    /** Languages the widget itself can render; `auto` follows the Harness language. */
    const LANGUAGE_CHOICES = ['auto', 'en', 'ru']

    /** Pick the dictionary for a language choice, falling back to English. */
    function dictionaryFor(choice, harnessLocale) {
      const wanted = choice === 'auto' ? harnessLocale : choice
      const primary = typeof wanted === 'string' ? wanted.toLowerCase().split('-')[0] : 'en'
      return Object.prototype.hasOwnProperty.call(dictionaries, primary) ? dictionaries[primary] : dictionaries.en
    }

    /** Build a translate function for one language choice. */
    function translatorFor(choice, harnessLocale) {
      const dict = dictionaryFor(choice, harnessLocale)
      return (key, params) => {
        const template = dict[key] ?? dictionaries.en[key] ?? key
        if (params === undefined || params === null) return template
        return template.replace(/\{(\w+)\}/g, (match, name) => (Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match))
      }
    }

    /** Text of a thrown value. */
    function messageOf(error) {
      return error instanceof Error ? error.message : String(error)
    }

    /** Turn the most common Docker daemon errors into short, translated widget copy. */
    function describeDockerError(text, tr) {
      const value = typeof text === 'string' ? text : ''
      if (value === '') return value
      if (/is restarting/i.test(value)) return tr('error.restarting')
      if (/is not running/i.test(value)) return tr('error.notRunning')
      if (/permission denied/i.test(value)) return tr('error.permission')
      if (/cannot connect to the docker daemon/i.test(value)) return tr('error.daemon')
      if (/no such container/i.test(value)) return tr('error.missing')
      return value
    }

    /* ------------------------------------------------------------------ *
     * Host transport
     * ------------------------------------------------------------------ */

    /**
     * Fetch one Host route through the page transport. The Desktop shell replaces
     * the page's fetch with an IPC bridge that carries `/api` routes; the Web
     * shell uses the page's own authenticated fetch.
     * @param path - route path without a leading slash.
     * @param init - fetch init.
     * @returns the response promise.
     */
    function transportFetch(path, init) {
      const transport = globalThis.__DSH_TRANSPORT__
      if (transport !== undefined && transport !== null && typeof transport.fetch === 'function') {
        return transport.fetch(path, init)
      }
      return fetch(path, { credentials: 'same-origin', cache: 'no-store', ...init })
    }

    /**
     * Call one endpoint of this plugin's Host routes.
     * @param endpoint - endpoint name (`state`, `action` or `diag`).
     * @param payload - JSON payload for POST endpoints.
     * @param signal - optional cancellation.
     * @returns the decoded response payload.
     */
    async function invoke(endpoint, payload, signal) {
      const init =
        endpoint === 'state'
          ? { method: 'GET' }
          : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload ?? {}) }
      const response = await transportFetch(`${API_BASE}/${endpoint}`, signal === undefined ? init : { ...init, signal })
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = undefined
      }
      if (!response.ok) {
        const detail = data !== undefined && typeof data.error === 'string' ? data.error : text.slice(0, 200)
        throw new Error(detail === '' ? `HTTP ${response.status}` : detail)
      }
      if (data === undefined) throw new Error(`HTTP ${response.status}: ответ не JSON`)
      return data
    }

    /**
     * Report one browser-half lifecycle event to the Host diagnostics endpoint.
     * @param event - event name.
     * @param detail - optional detail text.
     * @returns nothing; failures are ignored.
     */
    function report(event, detail) {
      const payload = { event, detail: typeof detail === 'string' ? detail : '' }
      void invoke('diag', payload).catch(() => {
        try {
          void fetch(DIAG_PATH, {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          }).catch(() => {})
        } catch {
          /* diagnostics must never break the panel */
        }
      })
    }

    /**
     * Page identity without its query string (never report a launch token).
     * @returns origin and path of the page.
     */
    function pageIdentity() {
      return typeof location === 'undefined' ? '' : `${location.origin}${location.pathname}`
    }

    /**
     * Prove the Host channel answers from this page, then report the result.
     * @returns nothing; failures are reported, never thrown.
     */
    async function probeHost() {
      const page = pageIdentity()
      try {
        const data = await invoke('state', {})
        const totals = data && data.totals ? data.totals : {}
        report('host-rpc', `${page} containers=${totals.containers ?? '?'} projects=${totals.projects ?? '?'}`)
      } catch (error) {
        report('host-rpc-failed', `${page} ${messageOf(error)}`)
      }
    }

    /* ------------------------------------------------------------------ *
     * Artwork
     * ------------------------------------------------------------------ */

    /**
     * Colored container-stack artwork for the guide card and the package icon.
     * @param props - optional pixel size.
     * @returns the artwork element.
     */
    function DockerArtwork(props) {
      const size = typeof props?.size === 'number' ? props.size : 26
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('rect', { x: 1.6, y: 1.6, width: 20.8, height: 20.8, rx: 6, fill: '#1D63D6' }),
        h('rect', { x: 5, y: 6.2, width: 14, height: 4.4, rx: 1.4, fill: '#FFFFFF', fillOpacity: 0.98 }),
        h('rect', { x: 5, y: 11.4, width: 14, height: 3.6, rx: 1.2, fill: '#FFFFFF', fillOpacity: 0.8 }),
        h('rect', { x: 6.6, y: 15.8, width: 10.8, height: 2.6, rx: 1.1, fill: '#FFFFFF', fillOpacity: 0.58 }),
      )
    }

    /**
     * Monochrome line glyph for tab chips and buttons.
     * @param props - glyph name and pixel size.
     * @returns the glyph element.
     */
    function Glyph(props) {
      const name = props.name
      const size = typeof props.size === 'number' ? props.size : 16
      const common = {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block' },
      }
      if (name === 'play') {
        return h('svg', common, h('path', { d: 'M5 3.2l7.4 4.8L5 12.8z', fill: 'currentColor' }))
      }
      if (name === 'stop') {
        return h('svg', common, h('rect', { x: 4.2, y: 4.2, width: 7.6, height: 7.6, rx: 1.7, fill: 'currentColor' }))
      }
      if (name === 'restart') {
        return h(
          'svg',
          common,
          h('path', {
            d: 'M12.7 8a4.7 4.7 0 1 1-1.5-3.4',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
          }),
          h('path', {
            d: 'M12.9 2.7v2.7h-2.7',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        )
      }
      if (name === 'refresh') {
        return h(
          'svg',
          common,
          h('path', {
            d: 'M13.2 8a5.2 5.2 0 1 1-1.7-3.8',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
          }),
          h('path', {
            d: 'M13.4 2.4v3h-3',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        )
      }
      if (name === 'logs') {
        return h(
          'svg',
          common,
          h('path', {
            d: 'M3.2 4.2l2.6 2.6-2.6 2.6',
            stroke: 'currentColor',
            strokeWidth: 1.4,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
          h('path', { d: 'M8 11.2h4.8', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        )
      }
      if (name === 'chevron') {
        return h(
          'svg',
          common,
          h('path', {
            d: 'M6.2 3.8L10.4 8l-4.2 4.2',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        )
      }
      if (name === 'close') {
        return h(
          'svg',
          common,
          h('path', {
            d: 'M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2',
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
          }),
        )
      }
      if (name === 'check') {
        return h('svg', common, h('path', { d: 'M3.4 8.4l3 3 6.2-6.4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }
      if (name === 'sort') {
        return h(
          'svg',
          common,
          h('path', {
            d: 'M2.6 4.4h7.4M2.6 8h5.6M2.6 11.6h3.8',
            stroke: 'currentColor',
            strokeWidth: 1.4,
            strokeLinecap: 'round',
          }),
          h('path', {
            d: 'M11.8 6.6v5.4M10 10.2l1.8 1.8 1.8-1.8',
            stroke: 'currentColor',
            strokeWidth: 1.4,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
        )
      }
      if (name === 'sound') {
        return h(
          'svg',
          common,
          h('path', { d: 'M3.2 6.2h2.3L8.4 3.8v8.4L5.5 9.8H3.2z', fill: 'currentColor' }),
          h('path', {
            d: 'M10.4 6a2.9 2.9 0 0 1 0 4M12.3 4.4a5.2 5.2 0 0 1 0 7.2',
            stroke: 'currentColor',
            strokeWidth: 1.2,
            strokeLinecap: 'round',
          }),
        )
      }
      if (name === 'star') {
        const starPath = 'M8 2.1l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.4l4-.6z'
        return h(
          'svg',
          common,
          props.filled === true
            ? h('path', { d: starPath, fill: 'currentColor' })
            : h('path', {
                d: starPath,
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1.2,
                strokeLinejoin: 'round',
              }),
        )
      }
      if (name === 'container') {
        return h(
          'svg',
          common,
          h('rect', { x: 2.4, y: 3.6, width: 11.2, height: 3.6, rx: 1.1, stroke: 'currentColor', strokeWidth: 1.2 }),
          h('rect', { x: 2.4, y: 8.4, width: 11.2, height: 3.2, rx: 1, stroke: 'currentColor', strokeWidth: 1.2 }),
        )
      }
      return null
    }

    /** Status dot. */
    function Dot(props) {
      return h('span', { className: 'dk-dot', 'data-tone': props.tone, title: props.title, 'aria-hidden': 'true' })
    }

    /** Compact square icon button with an accessible name. */
    function IconButton(props) {
      const { label, glyph, disabled, onClick, busy, size, confirm, active, filled } = props
      return h(
        'button',
        {
          type: 'button',
          className: 'dk-icon',
          title: label,
          'aria-label': label,
          disabled: disabled === true,
          'data-busy': busy === true ? 'true' : 'false',
          'data-confirm': confirm === true ? 'true' : 'false',
          'data-active': active === true ? 'true' : 'false',
          onClick,
        },
        h(Glyph, { name: busy === true ? 'refresh' : glyph, size: size ?? 14, filled: filled === true }),
      )
    }

    /** Page-local stylesheet, removed with the component. */
    function StyleSheet() {
      return h('style', { 'data-docker-sidebar': '' }, CSS)
    }

    /* ------------------------------------------------------------------ *
     * Panel
     * ------------------------------------------------------------------ */

    /** Short state label for one container. */
    function stateLabel(state, tr) {
      if (typeof state !== 'string' || state === '') return ''
      const key = `state.${state}`
      const label = tr(key)
      return label === key ? state : label
    }

    /** Dot tone of one container: a failed exit or a stalled run is the only red/yellow case. */
    function toneOfContainer(container, lastLogAt, hungMs) {
      const state = typeof container.state === 'string' ? container.state : ''
      if (state === 'running') {
        if (hungMs > 0 && typeof lastLogAt === 'number' && Date.now() - lastLogAt > hungMs) return 'warn'
        return 'success'
      }
      if (state === 'paused' || state === 'restarting') return 'warn'
      if (containerCrashed(container)) return 'error'
      return 'idle'
    }

    /** Aggregate tone of the strip dot: engine failure, crashes, unrest, activity, or all stopped. */
    function stripTone(summary) {
      if (summary.failed === true) return 'error'
      if (summary.crashed > 0) return 'error'
      if (summary.restless > 0) return 'warn'
      if (summary.running > 0) return 'success'
      return 'idle'
    }

    /** Visible container name: compose service when present, else container name. */
    function containerLabel(container) {
      return container.service !== undefined && container.service !== ''
        ? container.service
        : container.name
    }

    /** One container row: state dot, name, uptime and actions; a second line in detailed mode. */
    function ContainerRow(props) {
      const { container, tr, busy, locked, onAction, onOpenConsole, detail, lastLogAt, hungMs, showUptime } = props
      const { alerted, onAcknowledge } = props
      const state = typeof container.state === 'string' ? container.state : ''
      const running = state === 'running'
      const active = running || state === 'restarting'
      const stopKey = `container.stop:${container.id}`
      const startKey = `container.start:${container.id}`
      const restartKey = `container.restart:${container.id}`
      const status = typeof container.status === 'string' ? container.status : ''
      const image = typeof container.image === 'string' ? container.image : ''
      const ports = typeof container.ports === 'string' ? container.ports : ''
      const name = containerLabel(container)
      const stateText = stateLabel(state, tr)
      const tooltip = [container.name, stateText, image, ports].filter(part => typeof part === 'string' && part !== '').join(' · ')
      const extra = [image, ports].filter(part => part !== '').join(' · ')
      const acknowledge = typeof onAcknowledge === 'function' ? () => onAcknowledge(container) : undefined
      return h(
        'li',
        {
          className: 'dk-row',
          'data-alert': alerted === true ? 'true' : 'false',
          title: alerted === true ? tr('crashRowHint') : undefined,
          tabIndex: alerted === true ? 0 : undefined,
          onClick: acknowledge,
          onKeyDown:
            alerted === true && acknowledge !== undefined
              ? event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    acknowledge()
                  }
                }
              : undefined,
        },
        h(Dot, { tone: toneOfContainer(container, lastLogAt, hungMs), title: stateText }),
        h(
          'div',
          { className: 'dk-rowMain' },
          h(
            'div',
            { className: 'dk-rowLine' },
            h('span', { className: 'dk-rowName', title: tooltip }, name),
            status === '' || showUptime === false
              ? null
              : h('span', { className: 'dk-rowTime', title: status }, `(${status})`),
          ),
          detail === true && extra !== '' ? h('span', { className: 'dk-rowExtra', title: extra }, extra) : null,
        ),
        h(
          'span',
          { className: 'dk-actions' },
          typeof onOpenConsole === 'function'
            ? h(IconButton, { glyph: 'logs', label: tr('console'), onClick: () => onOpenConsole(container) })
            : null,
          active
            ? h(IconButton, {
                glyph: 'stop',
                label: tr('stop'),
                disabled: locked,
                busy: busy === stopKey,
                onClick: () => onAction('container.stop', { id: container.id }, stopKey),
              })
            : h(IconButton, {
                glyph: 'play',
                label: tr('start'),
                disabled: locked,
                busy: busy === startKey,
                onClick: () => onAction('container.start', { id: container.id }, startKey),
              }),
          h(IconButton, {
            glyph: 'restart',
            label: tr('restart'),
            disabled: locked,
            busy: busy === restartKey,
            onClick: () => onAction('container.restart', { id: container.id }, restartKey),
          }),
        ),
      )
    }

    /** Modal console: the last log lines of one container, opened from its row. */
    function LogsModal(props) {
      const { container, tr, entry, onClose, onReload } = props
      const name = containerLabel(container)
      React.useEffect(() => {
        const onKey = event => {
          if (event.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [onClose])
      return h(
        'div',
        {
          className: 'dk-modal',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': `${tr('console')}: ${name}`,
        },
        h('button', { type: 'button', className: 'dk-modalScrim', tabIndex: -1, 'aria-hidden': 'true', onClick: onClose }),
        h(
          'div',
          { className: 'dk-modalCard' },
          h(
            'div',
            { className: 'dk-modalHead' },
            h('span', { className: 'dk-modalTitle', title: container.name }, name),
            typeof container.id === 'string' && container.id !== ''
              ? h('span', { className: 'dk-modalSub' }, container.id.slice(0, 12))
              : null,
            h(
              'span',
              { className: 'dk-modalActions' },
              h(IconButton, {
                glyph: 'refresh',
                label: tr('refresh'),
                busy: entry.phase === 'loading',
                onClick: onReload,
              }),
              h(IconButton, { glyph: 'close', label: tr('dismiss'), onClick: onClose }),
            ),
          ),
          h(
            'div',
            { className: 'dk-modalBody' },
            entry.phase === 'ready'
              ? entry.text === ''
                ? h('p', { className: 'dk-modalEmpty' }, tr('logsEmpty'))
                : h('pre', { className: 'dk-logs dk-logs--modal' }, entry.text)
              : entry.phase === 'error'
                ? h('p', { className: 'dk-modalEmpty' }, entry.error)
                : h('p', { className: 'dk-modalEmpty' }, tr('loadingLogs')),
          ),
        ),
      )
    }

    /** localStorage key for the widget preferences. */
    const SETTINGS_KEY = 'docker-sidebar:settings'
    /** localStorage key for dismissable crash highlights. */
    const STORAGE_ALERTS = 'docker-sidebar:alerts'
    /** How long a user-triggered action keeps its containers out of crash alerts, in ms. */
    const USER_ACTION_GRACE_MS = 90_000
    /** Crash highlights older than this are dropped, in ms. */
    const ALERT_TTL_MS = 24 * 60 * 60 * 1000
    /** Refresh interval choices, in seconds; 0 turns polling off. */
    const POLL_CHOICES = [0, 2, 5, 10, 30]
    /** Console log line choices. */
    const CONSOLE_LINE_CHOICES = [200, 500, 1000, 2000]
    /** Ordering choices for projects and containers. */
    const SORT_CHOICES = ['status', 'name', 'project']
    /** Widget density choices. */
    const DENSITY_CHOICES = ['compact', 'normal', 'wide']
    /** Row font sizes, in pixels. */
    const FONT_CHOICES = [11, 12, 13, 14]
    /** Stalled-container thresholds, in minutes; 0 disables the check. */
    const HUNG_CHOICES = [0, 5, 15, 60]
    /** Alert sounds offered for a container crash. */
    const SOUND_CHOICES = ['off', 'twoTone', 'chime', 'alarm', 'ping']
    /** Preferences of the widget, before the user changes anything. */
    const DEFAULT_SETTINGS = {
      pollSeconds: 5,
      showCounters: true,
      showProjectCount: true,
      showAllButtons: true,
      showStandalone: true,
      confirmStopAll: true,
      consoleLines: 200,
      sortMode: 'status',
      hideStoppedProjects: false,
      pinnedProjects: [],
      hideEmptyWidget: false,
      density: 'compact',
      fontSize: 12,
      hungMinutes: 0,
      crashSound: 'off',
      detailedRows: false,
      showUptime: true,
      language: 'auto',
    }

    /** Coerce one stored object into the current preference shape. */
    function normalizeSettings(raw) {
      const out = { ...DEFAULT_SETTINGS }
      if (raw === null || typeof raw !== 'object') return out
      const poll = Number(raw.pollSeconds)
      if (POLL_CHOICES.includes(poll)) out.pollSeconds = poll
      for (const key of ['showCounters', 'showProjectCount', 'showAllButtons', 'showStandalone', 'confirmStopAll', 'hideStoppedProjects', 'hideEmptyWidget', 'detailedRows', 'showUptime']) {
        if (typeof raw[key] === 'boolean') out[key] = raw[key]
      }
      if (raw.crashSound === true) out.crashSound = 'twoTone'
      else if (raw.crashSound === false) out.crashSound = 'off'
      else if (SOUND_CHOICES.includes(raw.crashSound)) out.crashSound = raw.crashSound
      const lines = Number(raw.consoleLines)
      if (CONSOLE_LINE_CHOICES.includes(lines)) out.consoleLines = lines
      if (SORT_CHOICES.includes(raw.sortMode)) out.sortMode = raw.sortMode
      if (LANGUAGE_CHOICES.includes(raw.language)) out.language = raw.language
      if (DENSITY_CHOICES.includes(raw.density)) out.density = raw.density
      const font = Number(raw.fontSize)
      if (FONT_CHOICES.includes(font)) out.fontSize = font
      const hung = Number(raw.hungMinutes)
      if (HUNG_CHOICES.includes(hung)) out.hungMinutes = hung
      if (Array.isArray(raw.pinnedProjects)) {
        out.pinnedProjects = raw.pinnedProjects.filter(id => typeof id === 'string' && id !== '').slice(0, 200)
      }
      return out
    }

    /** Read the stored preferences, tolerating private mode and broken JSON. */
    function readSettings() {
      try {
        const text = typeof localStorage === 'undefined' ? null : localStorage.getItem(SETTINGS_KEY)
        return text === null ? { ...DEFAULT_SETTINGS } : normalizeSettings(JSON.parse(text))
      } catch {
        return { ...DEFAULT_SETTINGS }
      }
    }

    /** Where the preferences currently live, for the settings page. */
    const prefsSync = (() => {
      let value = 'loading'
      const listeners = new Set()
      const emit = () => {
        for (const listener of [...listeners]) listener()
      }
      return {
        getSnapshot: () => value,
        subscribe: listener => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        set: next => {
          if (next === value) return
          value = next
          emit()
        },
      }
    })()

    /** Shared preference store: the footer widget and the settings page read the same snapshot. */
    const settingsStore = (() => {
      let value = readSettings()
      const listeners = new Set()
      const emit = () => {
        for (const listener of [...listeners]) listener()
      }
      const persist = () => {
        try {
          if (typeof localStorage !== 'undefined') localStorage.setItem(SETTINGS_KEY, JSON.stringify(value))
        } catch {
          /* a store that refuses writes must not break the widget */
        }
      }
      /** Copy the current value into the profile document shared by every browser. */
      const push = () => {
        try {
          invoke('action', { action: 'prefs.set', target: { prefs: value } })
            .then(answer => prefsSync.set(answer && answer.ok === true ? 'profile' : 'local'))
            .catch(() => prefsSync.set('local'))
        } catch {
          prefsSync.set('local')
        }
      }
      return {
        getSnapshot: () => value,
        subscribe: listener => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        /** Re-read after another window changed the same key. */
        reload: () => {
          value = readSettings()
          emit()
        },
        /** Take the profile document as the starting point. */
        adopt: prefs => {
          value = normalizeSettings(prefs)
          persist()
          prefsSync.set('profile')
          emit()
        },
        /** Write the local value into the profile document. */
        push,
        /** Merge one patch, persist it and notify both surfaces. */
        update: patch => {
          value = normalizeSettings({ ...value, ...patch })
          persist()
          emit()
          push()
          return value
        },
        /** Restore every default. */
        reset: () => {
          value = { ...DEFAULT_SETTINGS }
          persist()
          emit()
          push()
          return value
        },
      }
    })()

    /** Last shared state counts, so the settings page can show what the widget currently sees. */
    const liveState = (() => {
      let value = { phase: 'idle', containers: 0, running: 0, projects: 0, standalone: 0, crashed: 0, version: '', pluginVersion: '' }
      const listeners = new Set()
      const emit = () => {
        for (const listener of [...listeners]) listener()
      }
      return {
        getSnapshot: () => value,
        subscribe: listener => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        publish: patch => {
          value = { ...value, ...patch }
          emit()
        },
      }
    })()

    /** Rank of a container for status ordering: running first, crashed last. */
    function containerRank(container) {
      if (container.state === 'running') return 0
      if (container.state === 'restarting' || container.state === 'paused') return 1
      if (container.state === 'dead') return 3
      if (container.state === 'exited' && typeof container.exitCode === 'number' && container.exitCode !== 0) return 2
      return 4
    }

    /** Whether one container ended in a failure state; a user stop or a plain kill is not a crash. */
    function containerCrashed(container) {
      if (container.state === 'dead') return true
      if (container.state !== 'exited') return false
      if (typeof container.exitCode !== 'number') return false
      if (container.exitCode === 0 || container.exitCode === 130 || container.exitCode === 143) return false
      // 137 is SIGKILL: a stop, a kill or the OOM killer. Only the memory case is a crash.
      if (container.exitCode === 137 && container.oomKilled !== true) return false
      return true
    }

    /** Sort a container list by the selected preference. */
    function sortContainers(list, mode) {
      const items = [...list]
      const byName = (left, right) =>
        containerLabel(left).localeCompare(containerLabel(right), undefined, { numeric: true, sensitivity: 'base' })
      items.sort((left, right) => {
        if (mode === 'status') {
          const delta = containerRank(left) - containerRank(right)
          if (delta !== 0) return delta
        }
        return byName(left, right)
      })
      return items
    }

    /** Sort the project list, pinned projects first. */
    function sortProjects(list, mode, pinned) {
      const items = [...list]
      const byName = (left, right) =>
        left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' })
      const byPath = (left, right) => {
        const leftPath = left.workingDir !== '' ? left.workingDir : left.name
        const rightPath = right.workingDir !== '' ? right.workingDir : right.name
        return leftPath.localeCompare(rightPath, undefined, { numeric: true, sensitivity: 'base' })
      }
      const rank = project => (project.running > 0 ? 0 : project.crashed === true ? 1 : 2)
      items.sort((left, right) => {
        const pinnedDelta = (pinned.has(right.id) ? 1 : 0) - (pinned.has(left.id) ? 1 : 0)
        if (pinnedDelta !== 0) return pinnedDelta
        if (mode === 'project') {
          const pathDelta = byPath(left, right)
          return pathDelta !== 0 ? pathDelta : byName(left, right)
        }
        if (mode === 'status') {
          const delta = rank(left) - rank(right)
          if (delta !== 0) return delta
        }
        return byName(left, right)
      })
      return items
    }

    /** One shared audio context for alert sounds, created on demand. */
    let crashAudio = null

    /** Play one named alert sound at full output; best effort, since audio may be blocked before the first click. */
    function playSound(name) {
      if (typeof name !== 'string' || name === 'off') return
      try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext
        if (typeof AudioCtor !== 'function') return
        crashAudio = crashAudio ?? new AudioCtor()
        const audio = crashAudio
        const schedule = () => {
          try {
            const start = audio.currentTime
            const master = audio.createGain()
            master.gain.setValueAtTime(0.0001, start)
            master.gain.exponentialRampToValueAtTime(1, start + 0.008)
            master.connect(audio.destination)
            const tone = (frequency, at, duration, type) => {
              const oscillator = audio.createOscillator()
              const gain = audio.createGain()
              oscillator.type = type
              oscillator.frequency.setValueAtTime(frequency, start + at)
              gain.gain.setValueAtTime(0.0001, start + at)
              gain.gain.exponentialRampToValueAtTime(1, start + at + 0.008)
              gain.gain.exponentialRampToValueAtTime(0.0001, start + at + duration)
              oscillator.connect(gain)
              gain.connect(master)
              oscillator.start(start + at)
              oscillator.stop(start + at + duration + 0.02)
            }
            if (name === 'twoTone') {
              tone(880, 0, 0.16, 'square')
              tone(620, 0.16, 0.22, 'square')
            } else if (name === 'chime') {
              tone(1046, 0, 0.55, 'triangle')
              tone(880, 0.12, 0.55, 'triangle')
              tone(698, 0.24, 0.65, 'triangle')
            } else if (name === 'alarm') {
              for (let index = 0; index < 6; index += 1) {
                tone(index % 2 === 0 ? 740 : 520, index * 0.13, 0.11, 'square')
              }
            } else if (name === 'ping') {
              tone(1320, 0, 0.8, 'square')
              tone(1980, 0.02, 0.4, 'square')
            }
          } catch {
            /* audio is a convenience, never a failure */
          }
        }
        if (audio.state === 'suspended') {
          audio.resume().then(schedule, schedule)
        } else {
          schedule()
        }
      } catch {
        /* audio is a convenience, never a failure */
      }
    }


    /* ------------------------------------------------------------------ *
     * Settings page
     * ------------------------------------------------------------------ */

    /** One settings row: title, hint and the control on the right. */
    function SettingsRow(props) {
      return h(
        'div',
        { className: 'dks-row' },
        h(
          'div',
          { className: 'dks-text' },
          h('span', { className: 'dks-title' }, props.title),
          props.hint === undefined ? null : h('span', { className: 'dks-hint' }, props.hint),
        ),
        h('div', { className: 'dks-control' }, props.children),
      )
    }

    /** On/off switch following the host switch pattern. */
    function SettingsSwitch(props) {
      const { checked, label, onChange } = props
      return h(
        'button',
        {
          type: 'button',
          className: 'dks-switch',
          role: 'switch',
          'aria-checked': checked ? 'true' : 'false',
          'aria-label': label,
          title: label,
          onClick: () => onChange(!checked),
        },
        h('span', { className: 'dks-knob', 'aria-hidden': 'true' }),
      )
    }

    /** Segmented choice: one option pressed at a time. */
    function SettingsSegments(props) {
      const { value, options, label, onChange } = props
      return h(
        'div',
        { className: 'dks-seg', role: 'group', 'aria-label': label },
        options.map(option =>
          h(
            'button',
            {
              key: String(option.value),
              type: 'button',
              className: 'dks-segItem',
              'aria-pressed': value === option.value ? 'true' : 'false',
              onClick: () => onChange(option.value),
            },
            option.label,
          ),
        ),
      )
    }

    /** The Docker section of the harness Settings dialog. */
    function DockerSettingsSection(props) {
      const { settings } = props
      const value = React.useSyncExternalStore(settings.subscribe, settings.getSnapshot, settings.getSnapshot)
      const localeStore = props.localeStore ?? IDLE_STORE
      const localeSnapshot = React.useSyncExternalStore(localeStore.subscribe, localeStore.getSnapshot, localeStore.getSnapshot)
      const harnessLocale = localeSnapshot !== undefined && localeSnapshot !== null && typeof localeSnapshot.active === 'string' ? localeSnapshot.active : 'en'
      const tr = translatorFor(value.language, harnessLocale)
      const live = React.useSyncExternalStore(liveState.subscribe, liveState.getSnapshot, liveState.getSnapshot)
      const sync = React.useSyncExternalStore(prefsSync.subscribe, prefsSync.getSnapshot, prefsSync.getSnapshot)
      const seconds = number => tr('settings.seconds', { value: number })
      const minutes = number => tr('settings.minutes', { value: number })
      const cliText =
        live.cli === 'ok' ? tr('settings.envFound') : live.cli === 'missing' ? tr('settings.envMissing') : tr('settings.envUnknown')
      const daemonText =
        live.engine === 'up' ? tr('settings.envUp') : live.engine === 'down' ? tr('settings.envDown') : tr('settings.envUnknown')
      const environment = `${tr('settings.env')}: ${tr('settings.envCli')} — ${cliText} · ${tr('settings.envDaemon')} — ${daemonText}${
        live.version === '' ? '' : ` · ${tr('settings.envVersion', { version: live.version })}`
      }`
      const environmentBad = live.cli === 'missing' || live.engine === 'down'
      const summary =
        live.phase === 'idle'
          ? tr('settings.nowUnknown')
          : tr('settings.now', {
              projects: live.projects,
              containers: live.containers,
              running: live.running,
              standalone: live.standalone,
              crashed: live.crashed,
            })
      return h(
        'div',
        { className: 'dks' },
        h('style', { 'data-docker-settings': '' }, SETTINGS_CSS),
        h('h2', { className: 'dks-heading' }, tr('settings.title')),
        h('p', { className: 'dks-sub' }, tr('settings.subtitle')),
        h('p', { className: 'dks-live' }, summary),
        h('p', { className: environmentBad ? 'dks-env dks-env--bad' : 'dks-env' }, environment),
        live.pluginVersion === '' ? null : h('p', { className: 'dks-env' }, tr('settings.build', { version: live.pluginVersion })),
        h(
          'p',
          { className: 'dks-note' },
          tr(sync === 'loading' ? 'settings.profileLoading' : sync === 'profile' ? 'settings.profile' : 'settings.profileLocal'),
        ),
        h(
          SettingsRow,
          { title: tr('settings.language'), hint: tr('settings.languageHint') },
          h(SettingsSegments, {
            label: tr('settings.language'),
            value: value.language,
            options: LANGUAGE_CHOICES.map(choice => ({
              value: choice,
              label: choice === 'auto' ? tr('settings.language.auto') : choice === 'en' ? 'English' : 'Русский',
            })),
            onChange: next => settings.update({ language: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.poll'), hint: tr('settings.pollHint') },
          h(SettingsSegments, {
            label: tr('settings.poll'),
            value: value.pollSeconds,
            options: POLL_CHOICES.map(choice => ({
              value: choice,
              label: choice === 0 ? tr('settings.off') : seconds(choice),
            })),
            onChange: next => settings.update({ pollSeconds: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.hideStopped'), hint: tr('settings.hideStoppedHint') },
          h(SettingsSwitch, {
            label: tr('settings.hideStopped'),
            checked: value.hideStoppedProjects,
            onChange: next => settings.update({ hideStoppedProjects: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.hideEmpty'), hint: tr('settings.hideEmptyHint') },
          h(SettingsSwitch, {
            label: tr('settings.hideEmpty'),
            checked: value.hideEmptyWidget,
            onChange: next => settings.update({ hideEmptyWidget: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.density'), hint: tr('settings.densityHint') },
          h(SettingsSegments, {
            label: tr('settings.density'),
            value: value.density,
            options: DENSITY_CHOICES.map(choice => ({ value: choice, label: tr(`settings.density.${choice}`) })),
            onChange: next => settings.update({ density: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.fontSize'), hint: tr('settings.fontSizeHint') },
          h(SettingsSegments, {
            label: tr('settings.fontSize'),
            value: value.fontSize,
            options: FONT_CHOICES.map(choice => ({ value: choice, label: `${choice}` })),
            onChange: next => settings.update({ fontSize: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.detailed'), hint: tr('settings.detailedHint') },
          h(SettingsSwitch, {
            label: tr('settings.detailed'),
            checked: value.detailedRows,
            onChange: next => settings.update({ detailedRows: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.counters'), hint: tr('settings.countersHint') },
          h(SettingsSwitch, {
            label: tr('settings.counters'),
            checked: value.showCounters,
            onChange: next => settings.update({ showCounters: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.projectCount'), hint: tr('settings.projectCountHint') },
          h(SettingsSwitch, {
            label: tr('settings.projectCount'),
            checked: value.showProjectCount,
            onChange: next => settings.update({ showProjectCount: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.uptime'), hint: tr('settings.uptimeHint') },
          h(SettingsSwitch, {
            label: tr('settings.uptime'),
            checked: value.showUptime,
            onChange: next => settings.update({ showUptime: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.allButtons'), hint: tr('settings.allButtonsHint') },
          h(SettingsSwitch, {
            label: tr('settings.allButtons'),
            checked: value.showAllButtons,
            onChange: next => settings.update({ showAllButtons: next }),
          }),
        ),
        h(
          SettingsRow,
          {
            title: tr('settings.standalone'),
            hint: `${tr('settings.standaloneHint')} ${tr('settings.standaloneNow', { count: live.standalone })}`,
          },
          h(SettingsSwitch, {
            label: tr('settings.standalone'),
            checked: value.showStandalone,
            onChange: next => settings.update({ showStandalone: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.confirmStopAll'), hint: tr('settings.confirmStopAllHint') },
          h(SettingsSwitch, {
            label: tr('settings.confirmStopAll'),
            checked: value.confirmStopAll,
            onChange: next => settings.update({ confirmStopAll: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.consoleLines'), hint: tr('settings.consoleLinesHint') },
          h(SettingsSegments, {
            label: tr('settings.consoleLines'),
            value: value.consoleLines,
            options: CONSOLE_LINE_CHOICES.map(choice => ({ value: choice, label: String(choice) })),
            onChange: next => settings.update({ consoleLines: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.hung'), hint: tr('settings.hungHint') },
          h(SettingsSegments, {
            label: tr('settings.hung'),
            value: value.hungMinutes,
            options: HUNG_CHOICES.map(choice => ({
              value: choice,
              label: choice === 0 ? tr('settings.off') : minutes(choice),
            })),
            onChange: next => settings.update({ hungMinutes: next }),
          }),
        ),
        h(
          SettingsRow,
          { title: tr('settings.crashSound'), hint: tr('settings.crashSoundHint') },
          h(
            'div',
            { className: 'dks-sound' },
            h(
              'select',
              {
                className: 'dks-select',
                value: value.crashSound,
                'aria-label': tr('settings.crashSound'),
                onChange: event => settings.update({ crashSound: event.target.value }),
              },
              SOUND_CHOICES.map(choice => h('option', { key: choice, value: choice }, tr(`settings.sound.${choice}`))),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dks-play',
                title: tr('settings.preview'),
                'aria-label': tr('settings.preview'),
                disabled: value.crashSound === 'off',
                onClick: () => playSound(value.crashSound),
              },
              h(Glyph, { name: 'sound', size: 14 }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'dks-actions' },
          h('button', { type: 'button', className: 'dks-reset', onClick: () => settings.reset() }, tr('settings.reset')),
        ),
      )
    }

    /** Navigation glyph of the Docker settings section. */
    function DockerSettingsIcon(props) {
      return h(DockerArtwork, { size: typeof props.size === 'number' ? props.size : 16 })
    }

    /** Settings page styles: rendered with the section, removed with it. */
    const SETTINGS_CSS = `
.dks{display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);}
.dks-heading{margin:0 0 4px;font-size:16px;font-weight:500;line-height:24px;}
.dks-sub{margin:0 0 18px;max-width:640px;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:19px;}
.dks-live{margin:-6px 0 16px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px;}
.dks-env{margin:-8px 0 6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px;}
.dks-env--bad{color:var(--dsw-alias-state-error-primary);}
.dks-note{margin:0 0 14px;color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:16px;}
.dks-row{display:flex;align-items:center;gap:48px;padding:12px 0;border-top:.5px solid var(--dsw-alias-border-l1);}
.dks-row:first-of-type{border-top:0;}
.dks-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;}
.dks-title{font-size:13px;line-height:19px;}
.dks-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px;}
.dks-control{flex:none;display:inline-flex;align-items:center;}
.dks-seg{display:inline-flex;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;overflow:hidden;background:var(--dsw-alias-bg-layer-1);}
.dks-segItem{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:3px 10px;cursor:pointer;white-space:nowrap;}
.dks-segItem+.dks-segItem{border-left:.5px solid var(--dsw-alias-border-l1);}
.dks-segItem[aria-pressed='true']{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-label-primary);}
@media (hover:hover){.dks-segItem:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dks-segItem:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:-2px;}
.dks-switch{position:relative;flex:none;width:34px;height:20px;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;}
.dks-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;background:var(--dsw-alias-label-secondary);transition:transform .12s ease,background .12s ease;}
.dks-switch[aria-checked='true']{background:var(--dsw-alias-brand-primary);border-color:transparent;}
.dks-switch[aria-checked='true'] .dks-knob{transform:translateX(14px);background:var(--dsw-alias-bg-layer-1);}
.dks-switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px;}
@media (prefers-reduced-motion:reduce){.dks-knob{transition:none;}}
.dks-actions{margin-top:20px;padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l1);}
.dks-sound{display:inline-flex;align-items:center;gap:6px;}
.dks-select{box-sizing:border-box;height:28px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:0 6px;cursor:pointer;}
.dks-select:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dks-play{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;}
.dks-play:disabled{opacity:.4;cursor:default;}
@media (hover:hover){.dks-play:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dks-play:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dks-reset{border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:4px 12px;cursor:pointer;}
@media (hover:hover){.dks-reset:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dks-reset:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
`


    /** A store that never yields data, used when the workspace projections are unavailable. */
    const IDLE_STORE = { getSnapshot: () => undefined, subscribe: () => () => {} }

    /** Comparable form of a filesystem path. */
    function normalizePath(value) {
      if (typeof value !== 'string') return ''
      return value.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
    }

    /** Whether one compose project lives inside one of the given workspace directories. */
    function projectInPaths(project, paths) {
      const dir = normalizePath(typeof project.workingDir === 'string' ? project.workingDir : '')
      if (dir === '' || paths.length === 0) return false
      return paths.some(base => dir === base || dir.startsWith(`${base}/`))
    }

    /** One compose project card: the project row is the parent, its containers are children. */
    function ProjectCard(props) {
      const { project, tr, busy, locked, collapsed, onAction, onToggle, onOpenConsole } = props
      const { pinned, onTogglePin, sortMode, detail, lastLogs, hungMs } = props
      const { here, alertIds, onAcknowledge } = props
      const showCount = props.showCount !== false
      const name = typeof project.name === 'string' && project.name !== '' ? project.name : project.id
      const running = typeof project.running === 'number' ? project.running : 0
      const total = typeof project.total === 'number' ? project.total : 0
      const startKey = `project.start:${project.id}`
      const stopKey = `project.stop:${project.id}`
      const restartKey = `project.restart:${project.id}`
      const containers = sortContainers(Array.isArray(project.containers) ? project.containers : [], sortMode ?? 'status')
      const failed = containers.some(containerCrashed)
      const unstable = containers.some(container => container.state === 'paused' || container.state === 'restarting')
      const projectTone = failed ? 'error' : unstable ? 'warn' : running > 0 ? 'success' : 'idle'
      const location =
        typeof project.workingDir === 'string' && project.workingDir !== ''
          ? project.workingDir
          : typeof project.configFile === 'string'
            ? project.configFile
            : ''
      const alerted = alertIds !== undefined && alertIds instanceof Set ? containers.some(container => alertIds.has(container.id)) : false
      return h(
        'section',
        {
          className: 'dk-project',
          'data-collapsed': collapsed ? 'true' : 'false',
          'data-active': collapsed ? 'false' : 'true',
          'data-pinned': pinned === true ? 'true' : 'false',
          'data-alert': alerted ? 'true' : 'false',
        },
        h(
          'div',
          { className: 'dk-projectHead' },
          h(
            'button',
            {
              type: 'button',
              className: 'dk-projectMain',
              title: location === '' ? name : location,
              'aria-expanded': collapsed ? 'false' : 'true',
              onClick: onToggle,
            },
            h(
              'span',
              { className: 'dk-caret', 'data-open': collapsed ? 'false' : 'true', 'aria-hidden': 'true' },
              h(Glyph, { name: 'chevron', size: 12 }),
            ),
            h('span', { className: 'dk-projectGlyph', 'aria-hidden': 'true' }, h(Glyph, { name: 'container', size: 14 })),
            h(
              'span',
              { className: 'dk-projectText' },
              h(
                'span',
                { className: 'dk-projectLine' },
                h('span', { className: 'dk-projectName' }, name),
                here === true ? h('span', { className: 'dk-projectHere' }, tr('here')) : null,
              ),
              location === '' ? null : h('span', { className: 'dk-projectPath' }, location),
            ),
          ),
          h(Dot, { tone: projectTone }),
          showCount ? h('span', { className: 'dk-projectCount' }, tr('project.count', { running, total })) : null,
          h(
            'span',
            { className: 'dk-actions' },
            typeof onTogglePin === 'function'
              ? h(IconButton, {
                  glyph: 'star',
                  label: pinned === true ? tr('unpinProject') : tr('pinProject'),
                  active: pinned === true,
                  filled: pinned === true,
                  onClick: () => onTogglePin(project),
                })
              : null,
            h(IconButton, {
              glyph: 'play',
              label: tr('start'),
              disabled: locked || running >= total,
              busy: busy === startKey,
              onClick: () => onAction('project.start', { project: project.id }, startKey),
            }),
            h(IconButton, {
              glyph: 'stop',
              label: tr('stop'),
              disabled: locked || !containers.some(container => container.state === 'running' || container.state === 'restarting'),
              busy: busy === stopKey,
              onClick: () => onAction('project.stop', { project: project.id }, stopKey),
            }),
            h(IconButton, {
              glyph: 'restart',
              label: tr('restart'),
              disabled: locked,
              busy: busy === restartKey,
              onClick: () => onAction('project.restart', { project: project.id }, restartKey),
            }),
          ),
        ),
        collapsed
          ? null
          : h(
              'ul',
              { className: 'dk-list' },
              containers.map(container =>
                h(ContainerRow, {
                  key: container.id,
                  container,
                  tr,
                  busy,
                  locked,
                  detail: detail === true,
                  showUptime: props.showUptime !== false,
                  alertIds,
                  onAcknowledge,
                  lastLogAt: lastLogs === undefined ? undefined : lastLogs[container.id],
                  hungMs: hungMs ?? 0,
                  onAction,
                  onOpenConsole,
                }),
              ),
            ),
      )
    }

    /** The Docker board: shared by the left-menu page and the right-Sidebar tab. */
    function DockerPanel(props) {
      const { t, useTabInfo, variant } = props
      const mode = variant === 'panel' ? 'panel' : 'sidebar'
      const tr = typeof t === 'function' ? t : key => key
      const info = typeof useTabInfo === 'function' ? useTabInfo() : undefined
      const visible = info?.tab?.visible !== false

      const [snapshot, setSnapshot] = React.useState({ phase: 'loading' })
      const [busy, setBusy] = React.useState('')
      const [actionError, setActionError] = React.useState('')
      const [collapsed, setCollapsed] = React.useState({})
      const mounted = React.useRef(true)

      React.useEffect(
        () => () => {
          mounted.current = false
        },
        [],
      )

      React.useEffect(() => {
        report('board-mount', mode)
      }, [])

      const load = React.useCallback(async quiet => {
        try {
          const data = await invoke('state', {})
          if (mounted.current) setSnapshot({ phase: 'ready', data })
        } catch (error) {
          if (!mounted.current) return
          setSnapshot(current =>
            current.phase === 'ready' && quiet === true
              ? { phase: 'ready', data: current.data, stale: messageOf(error) }
              : { phase: 'error', error: messageOf(error) },
          )
        }
      }, [])

      React.useEffect(() => {
        if (!visible) return undefined
        let stopped = false
        let timer
        const tick = async () => {
          await load(true)
          if (!stopped) timer = setTimeout(tick, POLL_MS)
        }
        tick()
        return () => {
          stopped = true
          if (timer !== undefined) clearTimeout(timer)
        }
      }, [visible, load])

      const refresh = React.useCallback(() => load(false), [load])

      const runAction = React.useCallback(async (action, target, busyKey) => {
        setBusy(busyKey)
        setActionError('')
        try {
          const data = await invoke('action', { action, target })
          if (!mounted.current) return
          if (data && data.state !== undefined) setSnapshot({ phase: 'ready', data: data.state })
          else await load(false)
          if (data && data.ok === false) setActionError(typeof data.error === 'string' ? data.error : tr('error.action', { message: '' }))
        } catch (error) {
          if (mounted.current) setActionError(messageOf(error))
        } finally {
          if (mounted.current) setBusy('')
        }
      }, [load, tr])

      const toggleProject = project => {
        setCollapsed(current => ({ ...current, [project.id]: current[project.id] !== true }))
      }

      const data = snapshot.phase === 'ready' ? snapshot.data : undefined
      const engine = data && data.engine ? data.engine : undefined
      const engineRunning = engine !== undefined && engine.running === true
      const projects = Array.isArray(data?.projects) ? data.projects : []
      const standalone = Array.isArray(data?.standalone) ? data.standalone : []
      const totals = data && data.totals ? data.totals : undefined
      const locked = busy !== ''
      const allCollapsed = projects.length > 0 && projects.every(project => collapsed[project.id] === true)
      const toggleAll = () => {
        if (projects.length === 0) return
        if (allCollapsed) {
          setCollapsed({})
          return
        }
        const next = {}
        for (const project of projects) next[project.id] = true
        setCollapsed(next)
      }

      let engineText = tr('loading')
      if (snapshot.phase === 'error') engineText = tr('engine.down')
      else if (data !== undefined) {
        const version = typeof engine?.serverVersion === 'string' ? engine.serverVersion : ''
        engineText = engineRunning
          ? version !== ''
            ? tr('engine.version', { version })
            : tr('engine.running')
          : tr('engine.down')
      }
      const tone = snapshot.phase === 'error' || (data !== undefined && !engineRunning) ? 'error' : engineRunning ? 'success' : 'idle'
      let transportLabel = '?'
      try {
        const transport = globalThis.__DSH_TRANSPORT__
        transportLabel = transport !== undefined && transport !== null && typeof transport.fetch === 'function' ? 'bridge' : 'fetch'
      } catch {
        transportLabel = '?'
      }
      const diagnosticNote = `${tr('diagnostic')}: ${transportLabel} · ${API_BASE} · ${pageIdentity()}`
      const updatedAt = typeof data?.updatedAt === 'number' ? new Date(data.updatedAt) : undefined
      const updatedText =
        updatedAt !== undefined && !Number.isNaN(updatedAt.getTime())
          ? tr('updated', { time: updatedAt.toLocaleTimeString() })
          : ''

      const children = []

      children.push(
        h(
          'header',
          { className: 'dk-head', key: 'head' },
          h(Dot, { tone }),
          h(
            'div',
            { className: 'dk-headText' },
            h('span', { className: 'dk-title' }, tr('tabTitle')),
            h('span', { className: 'dk-sub' }, engineText),
          ),
          projects.length > 0
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dk-toggleAll',
                  onClick: toggleAll,
                  disabled: locked,
                },
                allCollapsed ? tr('expandAll') : tr('collapseAll'),
              )
            : null,
          h(IconButton, {
            glyph: 'refresh',
            label: tr('refresh'),
            busy: busy === 'refresh',
            disabled: locked,
            onClick: () => runAction('refresh', {}, 'refresh'),
          }),
        ),
      )

      if (mode === 'panel') {
        children.push(h('p', { className: 'dk-pageSub', key: 'subtitle' }, tr('pageSubtitle')))
      }

      if (actionError !== '') {
        children.push(
          h(
            'div',
            { className: 'dk-alert', role: 'status', key: 'alert' },
            h('span', { className: 'dk-alertText' }, actionError),
            h(
              'button',
              {
                type: 'button',
                className: 'dk-link',
                onClick: () => setActionError(''),
              },
              tr('dismiss'),
            ),
          ),
        )
      }

      if (snapshot.phase === 'error') {
        children.push(
          h(
            'div',
            { className: 'dk-errorCard', key: 'error' },
            h('p', { className: 'dk-errorTitle' }, tr('error.title')),
            h('p', { className: 'dk-errorText' }, snapshot.error),
            h('p', { className: 'dk-errorNote' }, diagnosticNote),
            h(
              'button',
              {
                type: 'button',
                className: 'dk-button',
                onClick: refresh,
              },
              tr('retry'),
            ),
          ),
        )
      } else if (snapshot.phase === 'loading') {
        children.push(h('p', { className: 'dk-empty', key: 'loading' }, tr('loading')))
      } else if (!engineRunning) {
        children.push(
          h(
            'div',
            { className: 'dk-errorCard', key: 'down' },
            h('p', { className: 'dk-errorTitle' }, tr('engine.down')),
            h('p', { className: 'dk-errorText' }, typeof data?.error === 'string' ? data.error : ''),
            h(
              'button',
              {
                type: 'button',
                className: 'dk-button',
                onClick: refresh,
              },
              tr('retry'),
            ),
          ),
        )
      } else {
        children.push(
          h(
            'div',
            { className: 'dk-summary', key: 'summary' },
            totals
              ? h('span', { className: 'dk-tally' }, tr('totals.containers', { running: totals.running, total: totals.containers }))
              : null,
            totals ? h('span', { className: 'dk-tally' }, tr('totals.projects', { count: totals.projects })) : null,
          ),
        )

        if (projects.length > 0) {
          children.push(
            h(
              'div',
              { className: 'dk-section', key: 'projects' },
              h('h3', { className: 'dk-sectionTitle' }, tr('projects')),
              projects.map(project =>
                h(ProjectCard, {
                  key: project.id,
                  project,
                  tr,
                  busy,
                  locked,
                  collapsed: collapsed[project.id] === true,
                  onAction: runAction,
                  onToggle: () => toggleProject(project),
                }),
              ),
            ),
          )
        }

        if (standalone.length > 0) {
          children.push(
            h(
              'div',
              { className: 'dk-section', key: 'standalone' },
              h('h3', { className: 'dk-sectionTitle' }, tr('standalone')),
              h(
                'section',
                { className: 'dk-project' },
                h(
                  'ul',
                  { className: 'dk-list dk-list--flat' },
                  standalone.map(container =>
                    h(ContainerRow, {
                      key: container.id,
                      container,
                      tr,
                      busy,
                      locked,
                      onAction: runAction,
                    }),
                  ),
                ),
              ),
            ),
          )
        }

        if (projects.length === 0 && standalone.length === 0) {
          children.push(h('p', { className: 'dk-empty', key: 'empty' }, tr('empty')))
        }

        children.push(
          h(
            'footer',
            { className: 'dk-foot', key: 'foot' },
            snapshot.stale !== undefined
              ? h('span', { className: 'dk-stale', title: snapshot.stale }, engineText)
              : h('span', null, updatedText === '' ? engineText : updatedText),
          ),
        )
      }

      return h(
        'div',
        { className: `dk-board dk-board--${mode}` },
        h(StyleSheet, { key: 'style' }),
        h('div', { className: 'dk-inner', key: 'inner' }, children),
      )
    }

    /**
     * Close right-Sidebar tabs left over from the earlier right-panel layout of
     * this plugin: the type no longer exists, so such a tab would render empty.
     * @param ctx - Client plugin context.
     * @returns nothing; failures are ignored.
     */
    function retireOldTabs(ctx) {
      try {
        const sidebar = typeof ctx.get === 'function' ? ctx.get('sidebarRight') : undefined
        if (sidebar === undefined) return
        for (const tab of sidebar.openTabs.getSnapshot()) {
          if (tab.kind === 'docker') sidebar.close(tab.id)
        }
      } catch (error) {
        report('retire-tab-failed', messageOf(error))
      }
    }

    /**
     * Slot wrapper that reports a render crash and keeps the failure visible
     * instead of blanking the pane.
     */
    class PanelBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      componentDidCatch(error, info) {
        const stack = error !== null && typeof error === 'object' && typeof error.stack === 'string' ? error.stack : ''
        const component = info && typeof info.componentStack === 'string' ? info.componentStack : ''
        report('panel-crash', `${messageOf(error)} :: ${stack.slice(0, 600)} :: ${component.slice(0, 400)}`)
      }

      render() {
        if (this.state.error !== null) {
          return h('p', { className: 'dk-empty' }, `Ошибка панели: ${messageOf(this.state.error)}`)
        }
        return this.props.children
      }
    }

    /** Registered left-menu page: the board laid out as a full page. */
    function DockerPage(props) {
      return h(PanelBoundary, null, h(DockerPanel, { ...props, variant: 'panel' }))
    }

    /** localStorage key for the footer list open state. */
    const STORAGE_OPEN = 'docker-sidebar:open'
    /** localStorage key for the footer list's expanded project ids. */
    const STORAGE_EXPANDED = 'docker-sidebar:expanded'

    /** Read one localStorage value, tolerating private mode and quota errors. */
    function readStored(key, fallback) {
      try {
        const value = typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
        return value === null ? fallback : value
      } catch {
        return fallback
      }
    }

    /** Write one localStorage value, tolerating private mode and quota errors. */
    function writeStored(key, value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
      } catch {
        /* a store that refuses writes must not break the widget */
      }
    }

    /** Project-id map of expanded groups restored from localStorage; every row starts collapsed. */
    function readExpanded() {
      try {
        const parsed = JSON.parse(readStored(STORAGE_EXPANDED, '[]'))
        if (!Array.isArray(parsed)) return {}
        const out = {}
        for (const id of parsed) if (typeof id === 'string') out[id] = true
        return out
      } catch {
        return {}
      }
    }

    /** Container-id map of undismissed crash highlights restored from localStorage. */
    function readAlerts() {
      try {
        const parsed = JSON.parse(readStored(STORAGE_ALERTS, '{}'))
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
        const now = Date.now()
        const out = {}
        for (const [id, at] of Object.entries(parsed)) {
          if (typeof id === 'string' && typeof at === 'number' && now - at < ALERT_TTL_MS) out[id] = at
        }
        return out
      } catch {
        return {}
      }
    }

    /** The left-sidebar footer widget: a one-line strip with counters and a list above it. */
    function DockerFooterAction(props) {
      const { wide } = props
      const settings = React.useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot, settingsStore.getSnapshot)
      const localeStore = props.localeStore ?? IDLE_STORE
      const localeSnapshot = React.useSyncExternalStore(
        localeStore.subscribe,
        localeStore.getSnapshot,
        localeStore.getSnapshot,
      )
      const harnessLocale =
        localeSnapshot !== undefined && localeSnapshot !== null && typeof localeSnapshot.active === 'string'
          ? localeSnapshot.active
          : 'en'
      const tr = translatorFor(settings.language, harnessLocale)
      const label = tr('panel')
      const settingsRef = React.useRef(settings)
      settingsRef.current = settings
      const sessionsStore = props.sessionsStore ?? IDLE_STORE
      const workspacesStore = props.workspacesStore ?? IDLE_STORE
      const sessions = React.useSyncExternalStore(
        sessionsStore.subscribe,
        sessionsStore.getSnapshot,
        sessionsStore.getSnapshot,
      )
      const workspaces = React.useSyncExternalStore(
        workspacesStore.subscribe,
        workspacesStore.getSnapshot,
        workspacesStore.getSnapshot,
      )
      const [open, setOpen] = React.useState(() => readStored(STORAGE_OPEN, '0') === '1')
      const [expanded, setExpanded] = React.useState(readExpanded)
      const [snapshot, setSnapshot] = React.useState({ phase: 'loading' })
      const [busy, setBusy] = React.useState('')
      const [actionError, setActionError] = React.useState('')
      const [consoleTarget, setConsoleTarget] = React.useState(null)
      const [consoleEntry, setConsoleEntry] = React.useState({ phase: 'idle' })
      const [confirmingStopAll, setConfirmingStopAll] = React.useState(false)
      const [sortMenuOpen, setSortMenuOpen] = React.useState(false)
      const [alerts, setAlerts] = React.useState(readAlerts)
      const alertsRef = React.useRef(alerts)
      const [lastLogs, setLastLogs] = React.useState({})
      const mounted = React.useRef(true)
      const footRef = React.useRef(null)
      const sortWrapRef = React.useRef(null)
      const probeAt = React.useRef(0)

      React.useEffect(() => {
        try {
          const rect = footRef.current === null ? undefined : footRef.current.getBoundingClientRect()
          report(
            'footer-mount',
            rect === undefined ? 'none' : `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          )
        } catch (error) {
          report('footer-mount-failed', messageOf(error))
        }
      }, [])

      React.useEffect(
        () => () => {
          mounted.current = false
        },
        [],
      )

      const publishLive = data => {
        const totals = data && data.totals ? data.totals : undefined
        const groups = Array.isArray(data?.projects) ? data.projects : []
        const single = Array.isArray(data?.standalone) ? data.standalone : []
        const all = groups
          .flatMap(project => (Array.isArray(project.containers) ? project.containers : []))
          .concat(single)
        const engine = data && data.engine ? data.engine : undefined
        liveState.publish({
          phase: data && data.ok === false ? 'error' : 'ready',
          containers: typeof totals?.containers === 'number' ? totals.containers : all.length,
          running: typeof totals?.running === 'number' ? totals.running : all.filter(container => container.state === 'running').length,
          projects: groups.length,
          standalone: single.length,
          crashed: all.filter(containerCrashed).length,
          engine: data === undefined ? 'unknown' : engine !== undefined && engine.running === true ? 'up' : 'down',
          cli: data === undefined ? 'unknown' : engine !== undefined && engine.cli === false ? 'missing' : 'ok',
          version: engine === undefined ? '' : String(engine.serverVersion || engine.clientVersion || ''),
          pluginVersion: data && typeof data.version === 'string' ? data.version : '',
          error: data && typeof data.error === 'string' ? data.error : '',
        })
      }

      const refreshLastLogs = async data => {
        const groups = Array.isArray(data?.projects) ? data.projects : []
        const single = Array.isArray(data?.standalone) ? data.standalone : []
        const ids = groups
          .flatMap(project => (Array.isArray(project.containers) ? project.containers : []))
          .concat(single)
          .filter(container => container.state === 'running' && typeof container.id === 'string')
          .map(container => container.id)
          .slice(0, 50)
        if (ids.length === 0) {
          setLastLogs({})
          return
        }
        try {
          const answer = await invoke('action', { action: 'logs.lastAt', target: { ids } })
          if (!mounted.current) return
          if (answer && answer.ok === true && answer.seen !== undefined) setLastLogs(answer.seen)
        } catch {
          /* a failed probe keeps the previous timestamps */
        }
      }

      const load = React.useCallback(async () => {
        try {
          const data = await invoke('state', {})
          if (!mounted.current) return
          setSnapshot({ phase: 'ready', data })
          publishLive(data)
          if (settingsRef.current.hungMinutes > 0 && Date.now() - probeAt.current > 30000) {
            probeAt.current = Date.now()
            await refreshLastLogs(data)
          }
        } catch (error) {
          if (!mounted.current) return
          setSnapshot(current =>
            current.phase === 'ready'
              ? { phase: 'ready', data: current.data, stale: messageOf(error) }
              : { phase: 'error', error: messageOf(error) },
          )
        }
      }, [])

      React.useEffect(() => {
        let stopped = false
        let timer
        const tick = async () => {
          if (typeof document === 'undefined' || document.visibilityState !== 'hidden') await load()
          const seconds = settings.pollSeconds
          if (!stopped && seconds > 0) {
            timer = setTimeout(tick, open ? seconds * 1000 : Math.max(seconds * 1000, POLL_IDLE_MS))
          }
        }
        tick()
        return () => {
          stopped = true
          if (timer !== undefined) clearTimeout(timer)
        }
      }, [open, load, settings.pollSeconds])

      const toggleOpen = () => {
        setOpen(current => {
          const next = !current
          writeStored(STORAGE_OPEN, next ? '1' : '0')
          return next
        })
      }

      const toggleProject = project => {
        setExpanded(current => {
          const next = { ...current }
          if (next[project.id] === true) delete next[project.id]
          else next[project.id] = true
          writeStored(STORAGE_EXPANDED, JSON.stringify(Object.keys(next)))
          return next
        })
      }

      const togglePin = project => {
        const pinned = new Set(Array.isArray(settings.pinnedProjects) ? settings.pinnedProjects : [])
        if (pinned.has(project.id)) pinned.delete(project.id)
        else pinned.add(project.id)
        settingsStore.update({ pinnedProjects: [...pinned] })
      }

      const crashMemory = React.useRef(new Map())
      const ignoreRef = React.useRef(new Map())
      React.useEffect(() => {
        if (snapshot.phase !== 'ready') return
        const data = snapshot.data
        const containers = (Array.isArray(data?.projects) ? data.projects : [])
          .flatMap(project => (Array.isArray(project.containers) ? project.containers : []))
          .concat(Array.isArray(data?.standalone) ? data.standalone : [])
        const previous = crashMemory.current
        const nextMemory = new Map()
        const nextAlerts = { ...alertsRef.current }
        const now = Date.now()
        let alertsChanged = false
        let crashedNow = false
        for (const container of containers) {
          const crashed = containerCrashed(container)
          const was = previous.get(container.id) === true
          nextMemory.set(container.id, crashed)
          if (crashed) {
            const ignoredUntil = ignoreRef.current.get(container.id) ?? 0
            if (!was && now >= ignoredUntil && nextAlerts[container.id] === undefined) {
              nextAlerts[container.id] = now
              alertsChanged = true
              crashedNow = true
            }
          } else {
            ignoreRef.current.delete(container.id)
            if (nextAlerts[container.id] !== undefined) {
              delete nextAlerts[container.id]
              alertsChanged = true
            }
          }
        }
        crashMemory.current = nextMemory
        for (const id of Object.keys(nextAlerts)) {
          if (nextMemory.has(id)) continue
          delete nextAlerts[id]
          alertsChanged = true
        }
        if (alertsChanged) {
          alertsRef.current = nextAlerts
          setAlerts(nextAlerts)
          writeStored(STORAGE_ALERTS, JSON.stringify(nextAlerts))
        }
        if (crashedNow && settingsRef.current.crashSound !== 'off') playSound(settingsRef.current.crashSound)
      }, [snapshot])

      /** Mark the containers touched by a user action so their stop is never reported as a crash. */
      const suppressAlerts = (action, target) => {
        const ids = new Set()
        if (action.startsWith('container.') && target !== null && typeof target === 'object' && typeof target.id === 'string') {
          ids.add(target.id)
        }
        if (action.startsWith('project.') && target !== null && typeof target === 'object' && typeof target.project === 'string') {
          for (const project of projects) {
            if (project.id !== target.project) continue
            for (const container of Array.isArray(project.containers) ? project.containers : []) ids.add(container.id)
          }
        }
        if (action.startsWith('all.')) {
          for (const project of projects) {
            for (const container of Array.isArray(project.containers) ? project.containers : []) ids.add(container.id)
          }
          for (const container of standalone) ids.add(container.id)
        }
        if (ids.size === 0) return
        const until = Date.now() + USER_ACTION_GRACE_MS
        for (const id of ids) ignoreRef.current.set(id, until)
        const next = { ...alertsRef.current }
        let changed = false
        for (const id of ids) {
          if (next[id] === undefined) continue
          delete next[id]
          changed = true
        }
        if (!changed) return
        alertsRef.current = next
        setAlerts(next)
        writeStored(STORAGE_ALERTS, JSON.stringify(next))
      }

      /** Drop the crash highlight of one container on click. */
      const acknowledge = container => {
        const id = container !== null && typeof container === 'object' ? container.id : undefined
        if (typeof id !== 'string' || alertsRef.current[id] === undefined) return
        const next = { ...alertsRef.current }
        delete next[id]
        alertsRef.current = next
        setAlerts(next)
        writeStored(STORAGE_ALERTS, JSON.stringify(next))
      }

      const loadLogs = async container => {
        setConsoleEntry({ phase: 'loading' })
        try {
          const data = await invoke('action', {
            action: 'container.logs',
            target: { id: container.id, tail: settings.consoleLines },
          })
          if (!mounted.current) return
          if (data && data.ok === true && data.logs) {
            setConsoleEntry({ phase: 'ready', text: String(data.logs.text ?? '') })
          } else {
            setConsoleEntry({
              phase: 'error',
              error: data && typeof data.error === 'string' && data.error !== '' ? describeDockerError(data.error, tr) : tr('logsError'),
            })
          }
        } catch (error) {
          if (mounted.current) setConsoleEntry({ phase: 'error', error: messageOf(error) })
        }
      }

      const openConsole = container => {
        setConsoleTarget(container)
        void loadLogs(container)
      }

      const closeConsole = () => setConsoleTarget(null)

      React.useEffect(() => {
        if (!confirmingStopAll) return undefined
        const timer = setTimeout(() => setConfirmingStopAll(false), 4000)
        return () => clearTimeout(timer)
      }, [confirmingStopAll])

      // An action error is a hint, not a permanent state: clear it once the situation may have
      // changed on its own (the user fixed it from a terminal, or the next poll shows reality).
      React.useEffect(() => {
        if (actionError === '') return undefined
        const timer = setTimeout(() => setActionError(''), 15000)
        return () => clearTimeout(timer)
      }, [actionError])

      const requestStopAll = () => {
        if (settings.confirmStopAll && !confirmingStopAll) {
          setConfirmingStopAll(true)
          return
        }
        setConfirmingStopAll(false)
        void runAction('all.stop', {}, 'all.stop')
      }

      React.useEffect(() => {
        if (!sortMenuOpen) return undefined
        const onPointer = event => {
          const wrap = sortWrapRef.current
          if (wrap !== null && event.target instanceof Node && wrap.contains(event.target)) return
          setSortMenuOpen(false)
        }
        const onKey = event => {
          if (event.key === 'Escape') setSortMenuOpen(false)
        }
        document.addEventListener('mousedown', onPointer)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('mousedown', onPointer)
          document.removeEventListener('keydown', onKey)
        }
      }, [sortMenuOpen])

      const runAction = async (action, target, busyKey) => {
        suppressAlerts(action, target)
        setBusy(busyKey)
        setActionError('')
        try {
          const data = await invoke('action', { action, target })
          if (!mounted.current) return
          if (data && data.state !== undefined) setSnapshot({ phase: 'ready', data: data.state })
          else await load()
          if (data && data.ok === false && typeof data.error === 'string') setActionError(describeDockerError(data.error, tr))
        } catch (error) {
          if (mounted.current) setActionError(messageOf(error))
        } finally {
          if (mounted.current) setBusy('')
        }
      }

      const data = snapshot.phase === 'ready' ? snapshot.data : undefined
      const engine = data && data.engine ? data.engine : undefined
      const engineRunning = engine !== undefined && engine.running === true
      const projects = Array.isArray(data?.projects) ? data.projects : []
      const standalone = Array.isArray(data?.standalone) ? data.standalone : []
      const totals = data && data.totals ? data.totals : undefined
      const locked = busy !== ''
      const allContainers = projects
        .flatMap(project => (Array.isArray(project.containers) ? project.containers : []))
        .concat(standalone)
      const crashedCount = allContainers.filter(containerCrashed).length
      const restlessCount = allContainers.filter(
        container => container.state === 'paused' || container.state === 'restarting',
      ).length
      const runningCount = allContainers.filter(container => container.state === 'running').length
      // The strip dot summarises the containers: red for a real failure or a dead engine,
      // yellow for a paused/restarting one, green while at least one runs, grey when all stop.
      const tone = stripTone({
        failed: snapshot.phase === 'error' || (data !== undefined && !engineRunning),
        crashed: crashedCount,
        restless: restlessCount,
        running: runningCount,
      })
      const counters = totals === undefined ? '' : `${String(totals.running)}/${String(totals.containers)}`
      const startableCount = allContainers.filter(
        container => container.state === 'exited' || container.state === 'created' || container.state === 'dead',
      ).length
      const activeCount = allContainers.filter(
        container => container.state === 'running' || container.state === 'restarting',
      ).length
      const canStopAll = engineRunning && activeCount > 0 && !locked
      const canStartAll = engineRunning && startableCount > 0 && !locked
      const pinnedSet = new Set(Array.isArray(settings.pinnedProjects) ? settings.pinnedProjects : [])
      const decoratedProjects = projects.map(project => ({
        ...project,
        crashed: (Array.isArray(project.containers) ? project.containers : []).some(containerCrashed),
      }))
      const visibleProjects = decoratedProjects.filter(
        project =>
          settings.hideStoppedProjects !== true ||
          project.running > 0 ||
          project.crashed === true ||
          pinnedSet.has(project.id),
      )
      const orderedProjects = sortProjects(visibleProjects, settings.sortMode, pinnedSet)
      const orderedStandalone = sortContainers(standalone, settings.sortMode)
      const hungMs = settings.hungMinutes * 60000
      const hideForEmpty = settings.hideEmptyWidget === true && engineRunning && totals !== undefined && totals.containers === 0
      const alertIds = new Set(Object.keys(alerts))
      // Workspace directories of the chats currently in front: the badge follows the folder,
      // never the container list, so a project keeps its badge even when some of its
      // containers are not part of any session.
      const currentPaths = React.useMemo(() => {
        const byId = sessions && sessions.byId !== undefined ? sessions.byId : {}
        const items = workspaces && Array.isArray(workspaces.items) ? workspaces.items : []
        const openPaths = []
        for (const workspace of items) {
          const ids = Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []
          const open = ids.some(id => {
            const row = byId[id]
            return (
              row !== undefined &&
              row !== null &&
              row.retainedBy !== undefined &&
              row.retainedBy !== null &&
              (row.retainedBy.mainView ?? 0) > 0
            )
          })
          if (!open) continue
          const path = normalizePath(workspace.path)
          if (path !== '') openPaths.push(path)
        }
        if (openPaths.length > 0) return openPaths
        // No chat is open: fall back to the workspace of the most recently updated chat.
        let newestId
        let newestAt = -1
        for (const [id, row] of Object.entries(byId)) {
          if (row === undefined || row === null || typeof row.updatedAt !== 'number') continue
          if (row.origin === 'subagent' || row.parentId !== undefined || row.blank === true) continue
          if (row.updatedAt > newestAt) {
            newestAt = row.updatedAt
            newestId = id
          }
        }
        if (newestId === undefined) return []
        for (const workspace of items) {
          if (!Array.isArray(workspace.sessionIds) || !workspace.sessionIds.includes(newestId)) continue
          const path = normalizePath(workspace.path)
          if (path !== '') return [path]
        }
        return []
      }, [sessions, workspaces])

      if (wide !== true || hideForEmpty) return null

      const body =
        open === false
          ? null
          : h(
              'div',
              { className: 'dk-footBody' },
              h(StyleSheet, { key: 'style' }),
              actionError === '' ? null : h('p', { className: 'dk-footError' }, actionError),
              snapshot.phase === 'error'
                ? h('p', { className: 'dk-footEmpty' }, snapshot.error)
                : snapshot.phase === 'loading'
                  ? h('p', { className: 'dk-footEmpty' }, tr('loading'))
                  : null,
              data !== undefined && engine !== undefined && engine.cli === false
                ? h('p', { className: 'dk-footEmpty' }, tr('env.cliMissing'))
                : null,
              data !== undefined && data.ok === false && engine !== undefined && engine.cli !== false
                ? h('p', { className: 'dk-footEmpty' }, tr('env.daemonDown'))
                : null,
              orderedProjects.map(project =>
                h(ProjectCard, {
                  key: project.id,
                  project,
                  tr,
                  busy,
                  locked,
                  collapsed: expanded[project.id] !== true,
                  pinned: pinnedSet.has(project.id),
                  onTogglePin: togglePin,
                  sortMode: settings.sortMode,
                  detail: settings.detailedRows,
                  showUptime: settings.showUptime,
                  showCount: settings.showProjectCount,
                  here: projectInPaths(project, currentPaths),
                  alertIds,
                  onAcknowledge: acknowledge,
                  lastLogs,
                  hungMs,
                  onAction: runAction,
                  onToggle: () => toggleProject(project),
                  onOpenConsole: openConsole,
                }),
              ),
              orderedStandalone.length === 0 || settings.showStandalone === false
                ? null
                : h(
                    'ul',
                    { className: 'dk-list dk-list--flat' },
                    orderedStandalone.map(container =>
                      h(ContainerRow, {
                        key: container.id,
                        container,
                        tr,
                        busy,
                        locked,
                        detail: settings.detailedRows,
                        showUptime: settings.showUptime,
                        alertIds,
                        onAcknowledge: acknowledge,
                        lastLogAt: lastLogs[container.id],
                        hungMs,
                        onAction: runAction,
                        onOpenConsole: openConsole,
                      }),
                    ),
                  ),
              snapshot.phase === 'ready' && orderedProjects.length === 0 && orderedStandalone.length === 0
                ? h('p', { className: 'dk-footEmpty' }, tr('empty'))
                : null,
            )

      return h(
        React.Fragment,
        null,
        h('style', { 'data-docker-footer': '' }, FOOT_CSS),
        h(
          'div',
          {
            className: 'dk-foot',
            ref: footRef,
            'data-docker-foot': 'true',
            'data-open': open ? 'true' : 'false',
            'data-density': settings.density,
            style: { '--dk-font': `${settings.fontSize}px` },
          },
          h(
            'div',
            { className: 'dk-footHead' },
            h(
              'button',
              {
                type: 'button',
                className: 'dk-footToggle',
                'aria-label': open ? tr('collapse') : tr('expand'),
                'aria-expanded': open ? 'true' : 'false',
                title: open ? tr('collapse') : tr('expand'),
                onClick: toggleOpen,
              },
              h(Glyph, { name: 'chevron', size: 12 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dk-footTitle',
                title: open ? tr('collapse') : tr('expand'),
                'aria-expanded': open ? 'true' : 'false',
                onClick: toggleOpen,
              },
              h('span', { className: 'dk-footDot', 'data-tone': tone, 'aria-hidden': 'true' }),
              h(DockerArtwork, { size: 16 }),
              h('span', { className: 'dk-footLabel' }, label),
            ),
            counters === '' || settings.showCounters === false
              ? null
              : h('span', { className: 'dk-footCount' }, counters),
            open === false
              ? null
              : h(
                  'span',
                  { className: 'dk-sortWrap', ref: sortWrapRef },
                  h(IconButton, {
                    glyph: 'sort',
                    label: tr('sortHint', { mode: tr(`settings.sort.${settings.sortMode}`) }),
                    active: sortMenuOpen,
                    onClick: () => setSortMenuOpen(current => !current),
                  }),
                  sortMenuOpen
                    ? h(
                        'div',
                        { className: 'dk-menu', role: 'menu', 'aria-label': tr('settings.sort') },
                        SORT_CHOICES.map(choice =>
                          h(
                            'button',
                            {
                              key: choice,
                              type: 'button',
                              role: 'menuitemradio',
                              className: 'dk-menuItem',
                              'aria-checked': settings.sortMode === choice ? 'true' : 'false',
                              onClick: () => {
                                settings.update({ sortMode: choice })
                                setSortMenuOpen(false)
                              },
                            },
                            h(
                              'span',
                              { className: 'dk-menuCheck', 'aria-hidden': 'true' },
                              settings.sortMode === choice ? h(Glyph, { name: 'check', size: 12 }) : null,
                            ),
                            h('span', { className: 'dk-menuLabel' }, tr(`settings.sort.${choice}`)),
                          ),
                        ),
                      )
                    : null,
                ),
            settings.showAllButtons === false
              ? null
              : h(IconButton, {
                  glyph: 'stop',
                  label: confirmingStopAll ? tr('confirmStopAll') : tr('stopAll'),
                  disabled: !canStopAll,
                  confirm: confirmingStopAll,
                  busy: busy === 'all.stop',
                  onClick: requestStopAll,
                }),
            settings.showAllButtons === false
              ? null
              : h(IconButton, {
                  glyph: 'play',
                  label: tr('startAll'),
                  disabled: !canStartAll,
                  busy: busy === 'all.start',
                  onClick: () => runAction('all.start', {}, 'all.start'),
                }),
            h(IconButton, {
              glyph: 'refresh',
              label: tr('refresh'),
              disabled: locked,
              busy: busy === 'refresh',
              onClick: () => runAction('refresh', {}, 'refresh'),
            }),
          ),
          body,
        ),
        consoleTarget === null
          ? null
          : h(LogsModal, {
              container: consoleTarget,
              tr,
              entry: consoleEntry,
              onReload: () => loadLogs(consoleTarget),
              onClose: closeConsole,
            }),
      )
    }

    /** Footer widget styles: rendered with the widget, removed with it. */
    const FOOT_CSS = `
div:has(> * > [data-docker-foot]){flex-direction:column;align-items:stretch;height:auto;gap:6px;}
.dk-foot{box-sizing:border-box;width:100%;margin-bottom:2px;padding:4px 5px 5px;border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:2px;}
.dk-footHead{display:flex;align-items:center;gap:3px;min-width:0;padding:0 1px;}
.dk-footToggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:18px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;}
.dk-footToggle svg{transition:transform .13s ease;}
.dk-footToggle[aria-expanded='true'] svg{transform:rotate(90deg);}
@media (prefers-reduced-motion:reduce){.dk-footToggle svg{transition:none;}}
@media (hover:hover){.dk-footToggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dk-footToggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px;}
.dk-footTitle{display:flex;align-items:center;gap:5px;min-width:0;flex:1;padding:1px 3px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-weight:500;line-height:18px;cursor:pointer;overflow:hidden;}
@media (hover:hover){.dk-footTitle:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dk-footTitle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}
.dk-footDot{display:inline-block;flex:none;width:7px;height:7px;border-radius:999px;background:var(--dsw-alias-state-idle-primary);}
.dk-footDot[data-tone='success']{background:var(--dsw-alias-state-success-primary);}
.dk-footDot[data-tone='error']{background:var(--dsw-alias-state-error-primary);}
.dk-footDot[data-tone='warn']{background:var(--dsw-alias-state-warn-primary);}
.dk-footLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dk-footCount{flex:none;padding:0 5px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:16px;font-variant-numeric:tabular-nums;white-space:nowrap;}
.dk-foot .dk-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:20px;height:20px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;}
.dk-foot .dk-icon:disabled{opacity:.38;cursor:default;}
.dk-foot .dk-icon[data-busy='true'] svg{animation:dk-spin 1s linear infinite;}
@keyframes dk-spin{to{transform:rotate(360deg);}}
@media (hover:hover){.dk-foot .dk-icon:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dk-foot .dk-icon:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px;}
.dk-foot .dk-icon[data-confirm='true']{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 18%,transparent);color:var(--dsw-alias-state-warn-primary);}
.dk-footBody{display:flex;flex-direction:column;gap:3px;max-height:min(42vh,340px);overflow:auto;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);}
.dk-footBody .dk-project{border-radius:6px;background:transparent;}
.dk-footBody .dk-project[data-active='true']{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,transparent);box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary);}
.dk-footBody .dk-project[data-active='true'] .dk-projectName{font-weight:500;}
.dk-footBody .dk-projectHead{background:transparent;border-bottom:0;border-radius:6px;padding:2px 6px 2px 3px;}
@media (hover:hover){.dk-footBody .dk-projectHead:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dk-footBody .dk-projectName{font-size:calc(var(--dk-font,12px) + 0.5px);line-height:18px;}
.dk-footBody .dk-projectPath{display:none;}
.dk-footBody .dk-row{gap:6px;padding:2px 4px 2px 6px;}
.dk-footBody .dk-rowName{font-size:var(--dk-font,12px);}
.dk-footBody .dk-rowTime{font-size:calc(var(--dk-font,12px) - 1.5px);}
.dk-footBody .dk-rowExtra{font-size:calc(var(--dk-font,12px) - 2px);}
.dk-foot[data-density='normal'] .dk-footBody .dk-row{gap:7px;padding:4px 6px 4px 7px;}
.dk-foot[data-density='wide'] .dk-footBody .dk-row{gap:8px;padding:6px 8px 6px 9px;}
.dk-foot[data-density='wide'] .dk-footBody .dk-projectHead{padding:4px 8px 4px 5px;}
.dk-foot .dk-icon[data-active='true']{color:var(--dsw-alias-brand-primary);}
@keyframes dk-alert{0%,100%{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,transparent);}50%{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 34%,transparent);}}
.dk-footBody .dk-row[data-alert='true']{animation:dk-alert 1.5s ease-in-out infinite;box-shadow:inset 2px 0 0 var(--dsw-alias-state-error-primary);cursor:pointer;}
.dk-footBody .dk-row[data-alert='true'] .dk-rowName{font-weight:500;}
.dk-footBody .dk-row[data-alert='true']:focus-visible{outline:2px solid var(--dsw-alias-state-error-primary);outline-offset:-2px;}
.dk-footBody .dk-project[data-alert='true'] .dk-projectHead{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 16%,transparent);box-shadow:inset 2px 0 0 var(--dsw-alias-state-error-primary);border-radius:6px;}
@media (prefers-reduced-motion:reduce){.dk-footBody .dk-row[data-alert='true']{animation:none;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 26%,transparent);}}
.dk-sortWrap{position:relative;display:inline-flex;}
.dk-menu{position:absolute;top:calc(100% + 5px);right:0;z-index:40;display:flex;flex-direction:column;gap:1px;min-width:168px;padding:3px;border:.5px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 28px color-mix(in srgb,#000 24%,transparent);}
.dk-menuItem{display:flex;align-items:center;gap:6px;width:100%;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:5px 8px;text-align:left;cursor:pointer;}
.dk-menuItem[data-active='true'],.dk-menuItem[aria-checked='true']{background:var(--dsw-alias-interactive-bg-hover);}
@media (hover:hover){.dk-menuItem:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dk-menuItem:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px;}
.dk-menuCheck{display:inline-flex;flex:none;width:14px;height:14px;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);}
.dk-menuLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dk-footBody .dk-project[data-pinned='true'] .dk-projectName{font-weight:500;}
.dk-footBody .dk-project+.dk-project{margin-top:1px;}
.dk-projectLine{display:flex;align-items:center;gap:6px;min-width:0;}
.dk-projectHere{flex:none;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,transparent);color:var(--dsw-alias-brand-primary);font-size:10px;line-height:16px;padding:0 6px;white-space:nowrap;}
.dk-footBody .dk-list{padding:2px 2px 3px 20px;}
.dk-footBody .dk-list::before{left:10px;top:2px;bottom:6px;}
.dk-footBody .dk-row::before{left:-11px;width:10px;}
.dk-footBody .dk-empty{margin:2px 2px 4px;font-size:11.5px;line-height:16px;}
.dk-footEmpty{margin:2px 2px 4px;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;}
.dk-footError{margin:2px 2px 4px;color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px;word-break:break-word;}
.dk-modal{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
.dk-modalScrim{position:absolute;inset:0;padding:0;border:0;background:color-mix(in srgb,#000 45%,transparent);cursor:default;}
.dk-modalCard{position:relative;display:flex;flex-direction:column;width:min(780px,92vw);max-height:min(72vh,560px);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 14px 44px color-mix(in srgb,#000 32%,transparent);overflow:hidden;}
.dk-modalHead{display:flex;align-items:center;gap:8px;padding:7px 8px 7px 12px;border-bottom:.5px solid var(--dsw-alias-border-l1);}
.dk-modalTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:12.5px;font-weight:500;line-height:18px;}
.dk-modalSub{flex:none;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:16px;}
.dk-modalActions{margin-left:auto;display:inline-flex;align-items:center;gap:1px;flex:none;}
.dk-modal .dk-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:22px;height:22px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;}
.dk-modal .dk-icon:disabled{opacity:.38;cursor:default;}
.dk-modal .dk-icon[data-busy='true'] svg{animation:dk-spin 1s linear infinite;}
@media (hover:hover){.dk-modal .dk-icon:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dk-modal .dk-icon:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px;}
.dk-modalBody{flex:1;min-height:140px;overflow:auto;padding:10px 12px 12px;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);}
.dk-modalEmpty{margin:0;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;}
.dk-logs--modal{max-height:none;margin:0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:15px;white-space:pre-wrap;word-break:break-word;}
`

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */

    const CSS = `
.dk-board{box-sizing:border-box;height:100%;overflow:auto;color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:18px;font-family:inherit;-webkit-font-smoothing:antialiased;}
.dk-board *,.dk-board *::before,.dk-board *::after{box-sizing:border-box;}
.dk-board--sidebar{padding:10px 10px 18px;}
.dk-board--panel{padding:26px clamp(24px,4vw,44px) 64px;font-size:13px;line-height:19px;}
.dk-inner{display:flex;flex-direction:column;gap:12px;width:100%;max-width:920px;margin:0 auto;}
.dk-head{display:flex;align-items:center;gap:8px;padding:2px 2px 4px;}
.dk-headText{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;}
.dk-title{font-size:13px;font-weight:500;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dk-board--panel .dk-title{font-size:20px;font-weight:500;line-height:28px;}
.dk-sub{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dk-pageSub{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;max-width:720px;}
.dk-dot{display:inline-block;flex:none;width:7px;height:7px;border-radius:999px;background:var(--dsw-alias-state-idle-primary);}
.dk-dot[data-tone='success']{background:var(--dsw-alias-state-success-primary);}
.dk-dot[data-tone='error']{background:var(--dsw-alias-state-error-primary);}
.dk-dot[data-tone='warn']{background:var(--dsw-alias-state-warn-primary);}
.dk-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;}
.dk-icon:disabled{opacity:.38;cursor:default;}
.dk-icon[data-busy='true'] svg{animation:dk-spin 1s linear infinite;}
.dk-icon:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active);}
@media (hover:hover){.dk-icon:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dk-icon:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px;}
@keyframes dk-spin{to{transform:rotate(360deg);}}
.dk-toggleAll{flex:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:16px;padding:2px 5px;border-radius:6px;cursor:pointer;white-space:nowrap;}
.dk-board--sidebar .dk-toggleAll{display:none;}
.dk-toggleAll:disabled{opacity:.4;cursor:default;}
@media (hover:hover){.dk-toggleAll:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);}}
.dk-toggleAll:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}
.dk-summary{display:flex;flex-wrap:wrap;gap:4px 12px;padding:0 2px 8px;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;font-variant-numeric:tabular-nums;}
.dk-tally{white-space:nowrap;}
.dk-section{display:flex;flex-direction:column;gap:8px;margin-bottom:6px;}
.dk-sectionTitle{margin:0 0 2px;padding:0 2px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:500;line-height:16px;letter-spacing:.02em;text-transform:uppercase;}
.dk-project{border:.5px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);overflow:hidden;}
.dk-project+.dk-project{margin-top:8px;}
.dk-projectHead{display:flex;align-items:center;gap:6px;padding:3px 8px 3px 5px;background:var(--dsw-alias-bg-layer-2);border-bottom:.5px solid var(--dsw-alias-border-l1);}
.dk-project[data-collapsed='true'] .dk-projectHead{border-bottom-color:transparent;}
.dk-board--panel .dk-projectHead{padding:6px 10px 6px 6px;}
.dk-projectMain{display:flex;align-items:center;gap:6px;min-width:0;flex:1;padding:3px 2px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;border-radius:6px;}
.dk-projectMain:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}
.dk-caret{display:inline-flex;flex:none;color:var(--dsw-alias-label-secondary);}
.dk-caret svg{transition:transform .15s ease;}
.dk-caret[data-open='true'] svg{transform:rotate(90deg);}
.dk-projectGlyph{display:inline-flex;flex:none;color:var(--dsw-alias-label-secondary);}
.dk-projectText{display:flex;flex-direction:column;min-width:0;flex:1;}
.dk-projectName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:18px;}
.dk-projectPath{display:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:15px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
.dk-board--panel .dk-projectPath{display:block;}
.dk-projectCount{flex:none;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums;white-space:nowrap;}
.dk-actions{display:inline-flex;align-items:center;gap:1px;flex:none;}
.dk-list{list-style:none;margin:0;padding:4px 4px 6px 24px;position:relative;display:flex;flex-direction:column;}
.dk-list::before{content:'';position:absolute;left:13px;top:4px;bottom:10px;width:1px;background:var(--dsw-alias-border-l2);}
.dk-list--flat{padding:4px;}
.dk-list--flat::before{display:none;}
.dk-row{position:relative;display:flex;align-items:center;gap:7px;padding:4px 5px 4px 8px;border-radius:7px;}
.dk-row::before{content:'';position:absolute;left:-11px;top:50%;width:11px;height:1px;background:var(--dsw-alias-border-l2);}
.dk-list--flat .dk-row::before{display:none;}
@media (hover:hover){.dk-row:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dk-board--panel .dk-row{padding:6px 8px 6px 10px;}
.dk-rowName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:17px;}
.dk-rowTime{flex:none;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:17px;white-space:nowrap;font-variant-numeric:tabular-nums;}
.dk-rowMain{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;}
.dk-rowLine{display:flex;align-items:baseline;gap:6px;min-width:0;}
.dk-rowExtra{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:14px;}
.dk-logs{margin:0;padding:7px 8px;max-height:220px;overflow:auto;border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:15px;white-space:pre-wrap;word-break:break-word;}
.dk-empty{margin:4px 2px 10px;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;}
.dk-errorCard{display:flex;flex-direction:column;align-items:flex-start;gap:6px;margin:0 0 10px;padding:10px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);}
.dk-errorTitle{margin:0;font-size:12px;font-weight:500;line-height:17px;}
.dk-errorText{margin:0;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;word-break:break-word;}
.dk-errorNote{margin:0;color:var(--dsw-alias-label-secondary);opacity:.75;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;line-height:14px;word-break:break-all;}
.dk-button{border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;line-height:16px;padding:3px 10px;cursor:pointer;}
@media (hover:hover){.dk-button:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dk-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}
.dk-alert{display:flex;align-items:flex-start;gap:8px;margin:0 0 10px;padding:8px 9px;border-radius:8px;border:.5px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-1);}
.dk-alertText{flex:1;min-width:0;color:var(--dsw-alias-label-primary);font-size:11.5px;line-height:16px;word-break:break-word;}
.dk-link{flex:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:16px;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:2px;}
.dk-foot{padding:2px 2px 0;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:15px;}
.dk-stale{opacity:.7;}
.dk-chipTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
`

    /* ------------------------------------------------------------------ *
     * Plugin
     * ------------------------------------------------------------------ */

    return {
      inject: ['slots', 'locale', 'sessions', 'workspaces'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NAMESPACE, dictionaries), 'docker-sidebar: dictionaries')
        const serviceStore = service => {
          if (
            service === undefined ||
            service === null ||
            typeof service.getSnapshot !== 'function' ||
            typeof service.subscribe !== 'function'
          ) {
            return { getSnapshot: () => undefined, subscribe: () => () => {} }
          }
          return {
            getSnapshot: () => service.getSnapshot(),
            subscribe: listener => service.subscribe(listener),
          }
        }
        const sessionsStore = serviceStore(ctx.sessions)
        const workspacesStore = serviceStore(ctx.workspaces)
        const localeStore = serviceStore(ctx.locale)
        const harnessLocale = () => {
          const snapshot = localeStore.getSnapshot()
          return snapshot !== undefined && snapshot !== null && typeof snapshot.active === 'string' ? snapshot.active : 'en'
        }
        const tr = () => translatorFor(settingsStore.getSnapshot().language, harnessLocale())

        try {
          /* ---- Sidebar footer order (shared convention with @local/sidebar-widget-order) ---- */
          const SIDEBAR_ORDER_KEY = 'dsh.sidebar.footer.order.v1'
          const SIDEBAR_ORDER_EVENT = 'dsh/sidebar-footer-order'

          const readSidebarOrder = () => {
            try {
              const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(SIDEBAR_ORDER_KEY)
              const list = raw === null ? [] : JSON.parse(raw)
              return Array.isArray(list) ? list.filter(id => typeof id === 'string') : []
            } catch {
              return []
            }
          }

          const sidebarOrder = (id, fallback) => {
            const index = readSidebarOrder().indexOf(id)
            return index < 0 ? fallback : (index + 1) * 10
          }

          ctx.effect(
            () =>
              ctx.slots.inject('sidebar.footer.action', () => {
                let disposeEntry
                let live = true

                const install = () => {
                  if (!live) return
                  if (disposeEntry !== undefined) disposeEntry()
                  disposeEntry = ctx.slots.register(
                    {
                      name: 'sidebar.footer.action',
                      id: PANEL_ID,
                      order: sidebarOrder(PANEL_ID, 20),
                      locale: NAMESPACE,
                      label: () => tr()('panel'),
                      inject: () => ({ sessionsStore, workspacesStore, localeStore }),
                    },
                    DockerFooterAction,
                  )
                  report('footer-registered')
                }

                install()
                const off = ctx.on(SIDEBAR_ORDER_EVENT, install)
                return () => {
                  live = false
                  off()
                  if (disposeEntry !== undefined) disposeEntry()
                }
              }),
            'docker-sidebar: footer action',
          )

          retireOldTabs(ctx)

          ctx.effect(
            () =>
              ctx.slots.inject('settings.section', () =>
                ctx.slots.register(
                  {
                    name: 'settings.section',
                    id: 'docker',
                    order: 30,
                    locale: NAMESPACE,
                    label: () => tr()('settings.nav'),
                    inject: () => ({ settings: settingsStore, localeStore }),
                  },
                  DockerSettingsSection,
                ),
              ),
            'docker-sidebar: settings section',
          )

          ctx.effect(
            () =>
              ctx.slots.inject('settings.section.icon', () =>
                ctx.slots.register({ name: 'settings.section.icon', id: 'docker', order: 30 }, DockerSettingsIcon),
              ),
            'docker-sidebar: settings icon',
          )

          ctx.effect(() => {
            const onStorage = event => {
              if (event === undefined || event.key === null || event.key === SETTINGS_KEY) settingsStore.reload()
            }
            if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return undefined
            window.addEventListener('storage', onStorage)
            return () => window.removeEventListener('storage', onStorage)
          }, 'docker-sidebar: settings sync')

          ctx.effect(() => {
            let stopped = false
            let attempts = 0
            let timer
            const pull = async () => {
              try {
                const answer = await invoke('action', { action: 'prefs.get', target: {} })
                if (stopped) return
                if (
                  answer &&
                  answer.ok === true &&
                  answer.prefs !== null &&
                  typeof answer.prefs === 'object' &&
                  Object.keys(answer.prefs).length > 0
                ) {
                  settingsStore.adopt(answer.prefs)
                } else {
                  settingsStore.push()
                }
              } catch {
                if (stopped) return
                prefsSync.set('local')
                attempts += 1
                if (attempts < 3) timer = setTimeout(() => void pull(), 2000 * attempts)
              }
            }
            void pull()
            return () => {
              stopped = true
              if (timer !== undefined) clearTimeout(timer)
            }
          }, 'docker-sidebar: profile preferences')
        } catch (error) {
          report('client-apply-failed', messageOf(error))
          throw error
        }
        report('client-apply', pageIdentity())
        void probeHost()
      },
    }
  },
})
