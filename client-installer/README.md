# Skyforge — Friend Install Guide

Skyforge is a 1.21.1 NeoForge friends-only modpack. This guide gets you in.

**Total time: 5 minutes + first-launch download (3–10 min depending on internet).**

---

## 1. Install Prism Launcher (one-time)

Download from the official site: **<https://prismlauncher.org/download/>**

Pick your OS, run the installer. Log in with your Microsoft account.

> Already have Prism? Skip to step 2.

## 2. Download the Skyforge instance zip

Grab the latest from the release page (always works, always points at the newest version):

**<https://github.com/TZUAE86/skyforge/releases/latest/download/Skyforge-PrismInstance.zip>**

It's ~100 KB. All the actual mods come down on first launch (~700 MB) — keeps the zip tiny.

## 3. Extract into Prism's instances folder

| OS | Path |
|---|---|
| Windows | `%APPDATA%\PrismLauncher\instances\` |
| Linux | `~/.local/share/PrismLauncher/instances/` |
| macOS | `~/Library/Application Support/PrismLauncher/instances/` |

The zip contains a folder named `Skyforge/`. Extract it so the final structure is:

```
<instances-folder>/
└── Skyforge/
    ├── instance.cfg
    ├── mmc-pack.json
    └── .minecraft/
        └── packwiz-installer-bootstrap.jar
```

> **Common mistake:** double-nesting. If you end up with `instances/Skyforge/Skyforge/instance.cfg`, move the inner folder up one level.

## 4. Open Prism Launcher

You should see **Skyforge** in the instance list. If you don't, restart Prism — it scans the folder on startup.

## 5. Click Play

First launch:
- Prism downloads Minecraft 1.21.1 + NeoForge 21.1.228 (~150 MB)
- The pre-launch hook runs `packwiz-installer-bootstrap.jar` and pulls all ~250 mods + configs + kubejs (~700 MB)
- Game starts

That can take 3–10 minutes depending on your internet. Watch the Prism console window for progress.

**Every launch after that:** the bootstrap re-checks against the friend pack repo and syncs any changes (usually a few seconds). The pack always stays current — when the maintainer pushes a new mod or fix, your next launch picks it up automatically.

---

## Troubleshooting

**"Java not found"** — Prism usually auto-installs Java. If it doesn't: get Java 21 from <https://adoptium.net/temurin/releases/?version=21>.

**"Hash invalid!" during bootstrap** — GitHub Pages CDN propagation lag. Wait 2–3 minutes and relaunch.

**Game crashes on world load with OutOfMemoryError** — open Prism → right-click Skyforge → Edit Instance → Settings → Java → set "Maximum memory allocation" to **8192 MB** (8 GB). The instance ships with 8 GB already, but Prism can override that.

**Stuck on "Initializing" forever** — kill the process, relaunch. The bootstrap can hang on a partial download; restarting resumes cleanly.

**Voice chat doesn't connect** — Simple Voice Chat needs UDP 24454. Your firewall probably blocks UDP outbound. Allow `prismlauncher.exe` through Windows Firewall.

**Anything else** — ask in the friend server chat.
