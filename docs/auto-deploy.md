# Auto-Deploy to Homelab (Watchtower)

## What's set up

The `pelagica` container running on the homelab Proxmox LXC `arrmatey` (VMID 120,
`10.0.1.30`, compose file `/home/jermiah/arr-stack/docker-compose.yml`) auto-updates
whenever `docker-release.yml` pushes a new `ghcr.io/jjjermiah/pelagica:latest` image.

Mechanism: a second, tightly-scoped **Watchtower** container (`watchtower-pelagica`)
in the same compose file, polling GHCR every 5 minutes and pulling+recreating only
containers explicitly labeled for it.

```yaml
# arr-stack/docker-compose.yml (excerpt)
pelagica:
  ...
  labels:
    - "com.centurylinklabs.watchtower.enable=true"

watchtower-pelagica:
  image: containrrr/watchtower:latest
  container_name: watchtower-pelagica
  environment:
    - WATCHTOWER_LABEL_ENABLE=true      # only touches labeled containers
    - WATCHTOWER_POLL_INTERVAL=300      # 5 min
    - WATCHTOWER_CLEANUP=true           # remove old image after update
    - WATCHTOWER_INCLUDE_RESTARTING=true
    - WATCHTOWER_ROLLING_RESTART=true
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  restart: unless-stopped
```

No ports are published on `watchtower-pelagica` — it has no HTTP API, no listener,
nothing reachable from the network. It only makes outbound calls to GHCR to check
image digests, exactly like any other pull-based update tool.

## Why this approach (over self-hosted runner / webhook / manual SSH)

The user's hard requirement: **zero new inbound exposure** on the home network —
no GitHub Actions initiating SSH into the homelab, no new open port reachable from
the internet.

| Option | Inbound exposure | Blast radius if compromised | Complexity | Deploy latency |
|---|---|---|---|---|
| **Watchtower (chosen)** | None — pure outbound poll to GHCR | Limited to "can pull+recreate labeled containers"; no code execution from the repo | Low — one extra compose service | Poll interval (≤5 min) |
| Self-hosted GH Actions runner | None (runner long-polls GitHub outbound) | High — runner executes arbitrary workflow-defined commands with docker socket access on the same host that also runs sonarr/radarr/jellyfin/etc | Medium-high — install/patch runner binary, manage its lifecycle, token rotation | Near-instant |
| GitHub → webhook listener on LXC | Requires exposing a port/reverse-proxy endpoint to receive the webhook | New inbound listener = exactly the exposure the user ruled out | Medium | Near-instant |
| GitHub Actions SSHes into LXC | Explicit inbound SSH trust from a GitHub-hosted runner | Highest — a public/less-trusted runner gets a credential that can SSH into the home network | Low | Near-instant |

Watchtower wins on the primary constraint (zero inbound exposure) and has the
smallest blast radius: it can only pull images and recreate containers it's
explicitly labeled for — it does not execute arbitrary code from the repo, unlike
a self-hosted runner. The trade-off is deploy latency (up to 5 minutes vs.
instant), which is irrelevant for a personal single-container homelab service.

Label-based scoping (`WATCHTOWER_LABEL_ENABLE` + per-container label) means this
instance **only ever touches `pelagica`** — sonarr, radarr, jellyfin, qbittorrent,
prowlarr, jellyseerr, and every other service in the same compose file are
completely untouched by it.

## How to check its health

```bash
ssh arrmatey  # or: ssh mypve "pct exec 120 -- bash"

docker ps --filter name=watchtower-pelagica     # should show "Up ... (healthy)"
docker logs watchtower-pelagica --tail 30       # scan history
```

Each poll cycle logs a summary line, e.g.:

```
level=info msg="Session done" Failed=0 Scanned=1 Updated=0 notify=no
```

- `Scanned=1` confirms it's only picking up the one labeled container (`pelagica`).
- `Updated=1` after a new release means it pulled and recreated `pelagica`.
- `Failed>0` means a pull/recreate error — check the surrounding log lines.

To confirm it picked up a specific new release:

```bash
docker inspect pelagica --format '{{.Created}}'   # recreation timestamp
docker inspect pelagica --format '{{.Config.Image}}@{{index .RepoDigests 0}}'
```

## Rollback / disable

**Disable auto-update without removing anything** — just drop the label:

```bash
# edit arr-stack/docker-compose.yml, remove the `labels:` block under `pelagica`,
# then:
cd /home/jermiah/arr-stack && docker compose up -d pelagica
```

Watchtower will simply stop scanning it (`Scanned=0` on next cycle).

**Remove Watchtower entirely:**

```bash
cd /home/jermiah/arr-stack
docker compose stop watchtower-pelagica
docker compose rm -f watchtower-pelagica
# then delete the watchtower-pelagica service block (and the pelagica `labels:`
# block, optional) from docker-compose.yml
```

**Roll back a bad auto-deployed image** (pin to a known-good tag instead of
`latest`, which also implicitly pauses auto-update since Watchtower only chases
whatever tag is already configured):

```bash
cd /home/jermiah/arr-stack
# edit docker-compose.yml: pelagica.image: ghcr.io/jjjermiah/pelagica:<known-good-tag>
docker compose up -d pelagica
```

Config backups of the compose file live alongside it as
`docker-compose.yml.bak.<timestamp>` on `arrmatey` — restore from the most recent
one if a bad edit needs undoing wholesale.
