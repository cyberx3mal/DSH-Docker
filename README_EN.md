[README_RU](README_RU.md) · **README_EN**

# Docker in the sidebar

A DeepSeek Harness plugin that shows Docker state and your compose projects at the bottom of
the sidebar — the same seat the «Проекты» widget uses. No switching: you start, stop and read
container logs right from the strip.

```
●  Docker   3/7   ⇅  ■  ▶  ↻
```

Click the strip to unfold the project list, click a project to see its containers, one compact
line each: state dot, name, uptime in parentheses and the action buttons.

## What it does

- **Docker state** — a dot in the strip and on every project:
  - the strip dot summarises containers: green while at least one runs, yellow while one is
    paused or restarting, red when a container failed or Docker is unreachable, grey when every
    container is stopped;
  - a project dot says the same for that project's containers.
- **Projects and containers** — compose projects with expansion, standalone containers, and a
  running/total counter.
- **Log console** — a button on each container opens a window with the last log lines (200 by
  default) and a refresh button. Close it with the ✕, `Escape` or a click on the backdrop.
- **Controls** — start, stop and restart a single container, a whole project or everything at
  once (two global buttons left of refresh).
- **Crash highlight** — a crashed container pulses red; a collapsed project tints its header.
  A click on the row dismisses the highlight. Your own stops and restarts are never counted as
  crashes.
- **Sorting** — a button in the strip opens a menu: by status, by name, by project.
- **Pinning** — the star on a project keeps it on top of the list.
- **"here" badge** — marks the project you are working in (by the folder of the current chat).
- The strip state, project expansion, sorting and pins survive a reload.

## Settings

Settings live in **Settings → Docker** (with the Docker icon) and apply immediately:

| Setting | Values | Default |
|---|---|---|
| Language | Auto / English / Русский | Auto |
| Refresh interval | off, 2, 5, 10, 30 seconds | 5 s |
| Hide stopped projects | on/off | off |
| Hide empty widget | on/off | off |
| Density | compact / normal / wide | compact |
| Font size | 11 / 12 / 13 / 14 px | 12 |
| Detailed rows | on/off | off |
| Container counter | on/off | on |
| Project counter | on/off | on |
| Container uptime | on/off | on |
| Start-all / stop-all buttons | on/off | on |
| Standalone containers | on/off | on |
| Confirm "stop all" | on/off | on |
| Console log lines | 200 / 500 / 1000 / 2000 | 200 |
| Stalled container threshold | off, 5, 15, 60 minutes | off |
| Sound on crash | off / two-tone / chime / alarm / ping | off |

A few notes:

- **Language**: "Auto" follows the Harness language (which starts from the system language).
  You can force English or Russian for this widget independently of the rest of the UI.
- **Crash highlight** is not shown for containers you stopped or restarted yourself: a normal
  stop (`exit 130/143`) and a plain SIGKILL (`exit 137` without OOM) are not crashes, and
  actions taken from the widget keep the affected containers out of the check for 90 seconds.
- **Stalled threshold**: when a running container produced no new log lines for a while, its
  dot turns yellow.
- **Project counter**: the "running of total" text counts every container of the project,
  including one-off ones started by `docker compose run`, so the total can exceed the number
  of services. Turn it off here if the text is not wanted.
- **Stopping a restart loop**: Docker refuses a plain `docker stop` for a container that keeps
  restarting. The widget drops the restart policy for the moment of the stop, stops the
  container and restores the policy afterwards.
- **Sound on crash**: the chosen tone can be previewed with the speaker button next to the
  selector.

## Where settings are stored

Settings are shared by the whole profile: the Harness keeps them in
`$DSH_HOME/storages/docker-sidebar/prefs.json`, so the same profile in different browsers sees
the same values. The browser keeps a working copy (`localStorage`, key
`docker-sidebar:settings`), so the widget still works if the profile document is unavailable.
The settings page shows which of the two is in effect.

View state (what is expanded, sorting, pins, undismissed crashes) also lives in the browser:
`docker-sidebar:open`, `docker-sidebar:expanded`, `docker-sidebar:alerts`.

## Environment check

If Docker is not installed or `docker` is not on `PATH`, the widget shows what to do instead of
a bare error. The same when Docker Desktop or the docker service is installed but not running.
The environment status is visible on the settings page too.

## Install

```
plugin_manager: { action: install_bundle, target: "<absolute path to this folder>" }
```

`docker` must be available to the Harness process. After installing or updating the files the
host half needs a plugin restart (toggle the row in **Plugins**) and the page needs a reload.

The settings page shows the version of the installed plugin (“Plugin version 1.2.0”). If
another machine reports a different version, update the plugin folder:

```
git fetch origin
git reset --hard origin/main
```

(or clone the repository again) and restart the plugin. A plain `git pull` may fail when the
local copy comes from older rewritten history — `reset --hard` is the reliable way.

## Safety

- `docker` runs from the Harness process, which already manages containers.
- Every command is an argument array — no shell, no string interpolation.
- Container ids and project names are validated, and the action list is closed.
- The widget never removes images, volumes, networks or containers.
- Settings are validated for shape and size before they are written.

## Files

| File | What it is |
|---|---|
| `index.js` | host half: `docker` calls, state, actions, settings |
| `client.js` | browser half: strip, log console, settings page |
| `cordis.patch.yml` | inserts the plugin into the profile |
| `locale/en.json`, `locale/ru.json` | plugin title and description in Plugins |
| `icon.svg` | artwork |

Other languages: [README_RU](README_RU.md).

## For developers

Host routes (registered on the shared Connection bridge, so they work in both the web and the
desktop shell):

| Route | Method | Meaning |
|---|---|---|
| `/api/dsh-docker/state` | GET | engine state, projects, containers |
| `/api/dsh-docker/action` | POST | action on a container, a project or all of them |
| `/api/dsh-docker/diag` | GET/POST | browser-half diagnostics |

Actions: `container.start` / `container.stop` / `container.restart` / `container.logs` (with
`tail`), `project.start` / `project.stop` / `project.restart`, `all.start` / `all.stop` /
`all.restart`, `logs.lastAt` (with `ids`), `prefs.get` / `prefs.set`, `refresh`.

`GET /dsh-docker-diag` is a separate loopback-only route for the local operator: it returns the
last 20 browser-half reports.
