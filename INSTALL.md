# Installing Skyforge

Two ways to install. **Path A** is faster for newcomers; **Path B** auto-updates whenever the pack is updated.

**Both paths require:**
- **Java 21** — https://adoptium.net/ (Temurin 21 LTS, Windows installer)
- **Prism Launcher** — https://prismlauncher.org/

---

## Path A — One-click install (no auto-update)

Best if you're new to Prism and just want to play.

1. Go to **[Releases](https://github.com/TZUAE86/skyforge/releases/latest)** on this repo
2. Copy the URL of the `Skyforge-X.X.X.mrpack` asset (right-click → Copy link)
3. In Prism Launcher: **Add Instance → Import from zip → URL field → paste → OK**
4. Wait 5–15 min for it to download all 128 mods
5. Right-click the new instance → Edit Instance → Settings → Java → Memory → set Maximum to **8 GB** (or 12 GB if you have 16+ GB system RAM)
6. Launch

To get a new pack version: come back here, copy the new release's `.mrpack` URL, re-import (Prism will replace the instance — your saves are kept).

---

## Path B — Auto-update via packwiz (set once, sync forever)

Best for long-running servers where the pack changes regularly. Once set up, **every launch syncs the latest mods automatically**.

### One-time setup

1. **Add Instance → Custom →** name it "Skyforge" → select **Minecraft 1.21.1** → **OK**
2. In the new instance: **Edit Instance → Version → Install NeoForge** → version **21.1.228** → close
3. Right-click instance → **Folder → Instance Folder**. Inside that folder, open `.minecraft/` (or `minecraft/`)
4. Download `packwiz-installer-bootstrap.jar` from https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest and drop it in `.minecraft/`
5. Back in Prism: right-click instance → **Edit Instance → Settings → Custom Commands → tick "Custom commands"**
6. Set **Pre-launch command** to exactly this:
   ```
   "$INST_JAVA" -jar packwiz-installer-bootstrap.jar -g https://tzuae86.github.io/skyforge/pack.toml
   ```
7. **Settings → Java → Memory → 8 GB** (12 GB if you have 16+ GB RAM)
8. Launch

The first launch shows a small installer window downloading 128 mods (5–15 min). After that, every time you click Launch, Prism re-checks the manifest and syncs only what changed (~30 sec). No re-import, no re-share.

### What if a launch fails?

The bootstrap installer logs to `.minecraft/packwiz-installer.log`. The most common issue is a missing dependency on a newly-added mod — wait for the maintainer to push a fix, or (if you know what you're doing) drop the jar into `.minecraft/mods/` manually.

---

## Common to both paths

**Performance tips:**
- Allocate at least 8 GB RAM (12 GB recommended). 4 GB will OOM with this many mods.
- First launch is slow — 90–180 seconds while textures, models, and recipes initialize. Subsequent launches are 30–60 seconds.
- Distant Horizons builds a LOD cache the first time you explore each chunk. Don't disable it; just be patient on the first pass through any area.

**Server connection:**
- Most multiplayer scenarios: ask whoever's hosting for the IP/port
- The pack supports Simple Voice Chat — make sure UDP 24454 is open

**Troubleshooting:**

| Problem | Fix |
|---|---|
| `unable to open supplied modpack zip file` (Path A) | You pasted `pack.toml` URL instead of a `.mrpack` release URL. Use the Releases page link, not the GitHub Pages URL. |
| `OutOfMemoryError` on launch | Bump RAM in Prism Java settings (above). |
| First launch hangs at "Loading mods" | Normal for 2–3 min. Wait. |
| Crash with "Mod X requires Y" on Path B | Maintainer pushed a new mod that depends on something not yet on the server — open an issue on this repo. |
| Voice chat doesn't connect | UDP 24454 not forwarded on your router/firewall. |
