# Skyforge — dedicated server pack

Server-only build of Skyforge. **107 mods**, **~680 MB**. Strips every client-side mod (Sodium, Iris, Distant Horizons, EMI/JEI, Xaero's, HUDs, etc.) — those either crash a dedicated server or just waste RAM with no benefit.

**Tech stack:** Minecraft 1.21.1 + NeoForge 21.1.228 + Java 21.

## What's in this folder

- `mods/` — 107 server-side jars (worldgen, gameplay, server-tick optimizers)
- `eula.txt` — pre-set to `eula=true`
- `server.properties` — sane defaults for ~10 players
- `start-server.bat` / `start-server.sh` — launchers with Aikar's flags + 12 GB heap
- `docker-compose.yml` — drop-in deployment via [itzg/minecraft-server](https://docker-minecraft-server.readthedocs.io/)
- This README

## Quick decision

| | **A. Bare-metal (Windows/Linux)** | **B. Docker** |
|---|---|---|
| Setup | Download NeoForge installer, run it, drop mods in | One `docker compose up -d` |
| Deps to install | Java 21 + the installer | Docker only |
| Best for | A spare PC, dev box, simple VPS | Anything else |
| Recommended | If you've never run a Minecraft server | If you have Docker already |

---

## Path A — Bare-metal install (Windows or Linux)

### 1. Install Java 21

- Windows: [Adoptium Temurin 21 LTS](https://adoptium.net/) installer.
- Linux: `sudo apt install openjdk-21-jre-headless` (Debian/Ubuntu) or your distro's equivalent.

Verify: `java -version` should report `21`.

### 2. Download the NeoForge 21.1.228 installer

Direct link: <https://maven.neoforged.net/releases/net/neoforged/neoforge/21.1.228/neoforge-21.1.228-installer.jar>

Drop it in this folder (`skyforge-server/`) next to `mods/`.

### 3. Install the server

```
java -jar neoforge-21.1.228-installer.jar --installServer
```

That generates `run.bat` / `run.sh` plus a `libraries/` folder. Takes ~2 min.

### 4. Launch

- Windows: double-click `start-server.bat`
- Linux: `chmod +x start-server.sh && ./start-server.sh`

The launcher **auto-updates from GitHub** on every start — runs `packwiz-installer-bootstrap.jar` against the friend pack URL (`https://raw.githubusercontent.com/TZUAE86/skyforge/main/pack.toml`), syncs all server-side mods + config + kubejs to match `main`, then starts the server. Set `SKYFORGE_AUTOUPDATE=0` to skip the sync (e.g. for offline boots).

First boot is **slow** — 3–8 min while NeoForge initializes ~125 mods, builds registries, sets up worldgen. Watch the console for `[Server thread/INFO]: Done (Ns)!`. After that, `tps` should hover at 20.

### 5. Open ports on your firewall / router

- **TCP 25565** — vanilla Minecraft connections
- **UDP 24454** — Simple Voice Chat (skip if you don't use voice)

Your friends connect to your public IP at port 25565.

---

## Path B — Docker (recommended for anything but a Windows desktop)

Requires Docker Desktop / Docker Engine.

```
cd skyforge-server
docker compose up -d
docker compose logs -f       # follow boot output
```

That's it. The `itzg/minecraft-server:java21` image:
- Installs NeoForge 21.1.228 automatically
- Reads `eula.txt` and `server.properties`
- **Auto-updates from the latest GitHub Release** via `MODRINTH_MODPACK` (the compose file points at `https://github.com/TZUAE86/skyforge/releases/latest/download/Skyforge-latest.mrpack`)
- Applies Aikar's flags via `USE_AIKAR_FLAGS=TRUE`
- Persists worlds + configs to `./data/`

**Common ops:**
```
docker compose down                    # stop server
docker compose restart                 # restart (e.g. after editing config)
docker compose exec skyforge rcon-cli  # admin console
docker compose up -d --force-recreate  # force re-pull the latest mrpack
```

To pin a specific version, edit `MODRINTH_MODPACK` in `docker-compose.yml` to a versioned URL (e.g. `.../v0.8.1/Skyforge-0.8.1.mrpack`) and `docker compose up -d`.

---

## What was removed vs the client pack

The client pack ([../skyforge/](../skyforge/)) has 128 mods. This server pack drops **23** that are pure client-side:

**Rendering / FPS** (would crash a headless server)
- Sodium, Iris, Sodium Extra, Reese's Sodium Options, Iris-Flywheel-Compat
- ImmediatelyFast, Dynamic FPS, EntityCulling
- Distant Horizons (this is the big one — DH renders LOD on the **client**, not server)

**UI / HUD / Maps** (no display on a server)
- Xaero's Minimap, Xaero's World Map
- Jade, AppleSkin, Inventory HUD+
- Cumulus, DotumChe, Cosmetic Armor Reworked Forked

**Recipe viewers** (client-only by design)
- EMI, JEI, Just Enough Resources

**Input** (no keyboard on a server)
- Controlling, Mouse Tweaks

**Client-only optimizations** (do nothing server-side)
- Ksyxis (skips client spawn pre-load), Krypton FNP, XPlus Autofish

## What was kept (server-perf wins)

- **Lithium** — server tick optimization (the main one)
- **C2ME** — parallel chunk loading on server
- **Noisium** — worldgen optimization
- **ModernFix, FerriteCore** — memory efficiency
- **Spark** — `/spark profiler` is your debug tool when TPS drops; `/spark tps` shows tick rate
- **Chunky** — `/chunky start` pre-generates a 5000-block radius around spawn so first-time exploration doesn't lag
- **Alternate Current** — drops in a much faster redstone implementation (huge if any Create power lines exist)
- All of MineColonies, Create + Aeronautics + Sable + addons, Mekanism, Iron's Spellbooks, Ars Nouveau, FTB Quests/Library/Teams/Chunks, Cataclysm, etc.

## Recommended first-launch admin commands

After server boots and you connect once to op yourself (`op <yourname>` from console), run these once:

```
/spark tps                                # baseline TPS
/chunky radius 5000                       # 5000-block radius around spawn
/chunky start                             # pre-gen runs in background, can take 1-3 hours
/chunky pause                             # pause if TPS drops too far
```

Then `/forceload add <x1> <z1> <x2> <z2>` for any specific chunks you want kept loaded (Create factory areas, MineColonies starter colonies, etc.).

## Tuning RAM

Default is **12 GB heap**. Adjust based on your machine:

- **8 GB host** → set `MEMORY: "6G"` (Docker) or `set SKYFORGE_RAM=6G` (start-server.bat)
- **16 GB host** → `12G` (default)
- **32 GB host** → `16G`
- **More than that** → there's no benefit beyond 16 GB for Minecraft; Java's GC starts struggling

## Troubleshooting

| Problem | Fix |
|---|---|
| `Exception in thread "main" java.lang.UnsupportedClassVersionError` | Wrong Java. Need 21, you have older. |
| Boots but mods crash on load | Check `logs/latest.log` — usually a missing dep. Make sure ALL of `mods/` was copied, not just some. |
| **`java.lang.OutOfMemoryError: Java heap space` during world load** | **Server was launched with a small heap (often `-Xmx1G` from a hosting-panel default). FIX: ensure `user_jvm_args.txt` is in the server folder (it's shipped here pre-configured for 6 GB) — `run.sh` / `run.bat` read this file automatically. If using a hosting panel, set the memory slider to at least 6 GB.** |
| Server idle but laggy | Run `/spark profiler --timeout 60` in console, paste the URL it gives you. Most likely a runaway entity or loaded chunk. |
| `Out of memory` mid-game | Bump `MEMORY` higher OR reduce `view-distance` / `simulation-distance` in `server.properties`. |
| Players see "Outdated server" | Their client is on a newer Minecraft version. Pin them to 1.21.1 in their launcher. |
| Voice chat doesn't work | UDP 24454 not forwarded. Open it on your router/firewall. |
| MineColonies citizens stuck | Known to be heavy on path-finding. Keep colony chunks force-loaded; reduce `simulation-distance`. |

## Updating the server

**Auto-update is wired up — usually you don't need to do anything.**

- **Bare-metal (Path A):** `start-server.sh` / `.bat` runs `packwiz-installer-bootstrap.jar` against `main` on every start. Restart the server → it syncs to whatever's in the friend pack repo on `main`.
- **Docker (Path B):** the compose file's `MODRINTH_MODPACK` env points at the latest GitHub Release. `docker compose up -d --force-recreate` re-pulls.

The bootstrap uses `--side server`, so client-only mods (Sodium, Iris, Distant Horizons, Xaero's, JEI/EMI, etc. — see [Side-tagging](#side-tagging) below) are skipped automatically.

### Manual hand-edits

Only needed if you want to test something locally before pushing to `main`:
1. New mod → drop the `.jar` into this folder's `mods/`
2. Mod removed → delete the `.jar`
3. Mod updated → swap the `.jar` for the new version

Set `SKYFORGE_AUTOUPDATE=0` (bare-metal) before launch to keep your local changes from being overwritten.

**Important: the client pack and server pack must agree on every gameplay-affecting mod and version.** Auto-update from the same `pack.toml` URL guarantees this — clients and server sync from the same source of truth.

### Side-tagging

The friend pack tags each mod with `side = "client"`, `"server"`, or `"both"` in its `*.pw.toml`. The server bootstrap reads `--side server` and skips anything tagged `client`. Currently tagged `client`: Sodium, Iris, Sodium Extra, Reese's Sodium Options, Iris-Flywheel-Compat, ImmediatelyFast, Dynamic FPS, EntityCulling, Distant Horizons, Xaero's Minimap, Xaero's World Map, Jade, AppleSkin, Inventory HUD+, Cumulus, Cosmetic Armor Reworked Forked, EMI, JEI, Just Enough Resources, Controlling, Mouse Tweaks, Ksyxis, Krypton FNP, XPlus Autofish, Iceberg, Searchables.
