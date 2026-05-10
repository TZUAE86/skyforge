# Skyforge

Minecraft 1.21.1 NeoForge modpack — Create + Aeronautics, magic, tech, MineColonies.
**128 mods.** Auto-update via packwiz.

[Latest release](https://github.com/TZUAE86/skyforge/releases/latest) · [Pack URL (Path B)](https://tzuae86.github.io/skyforge/pack.toml)

---

## Install

Two paths — pick based on whether you want auto-updates.

**Both paths require:**
- **Java 21** — https://adoptium.net/ (Temurin 21 LTS)
- **Prism Launcher** — https://prismlauncher.org/  *(or CurseForge App — see Path A)*

---

### Path A — One-click install (no auto-update)

Best if you're new to Prism and just want to play.

1. In Prism Launcher: **Add Instance → Import from zip → URL field → paste:**
   ```
   https://github.com/TZUAE86/skyforge/releases/latest/download/Skyforge-0.1.0.mrpack
   ```
   *(CurseForge App users: use `Skyforge-0.1.0.zip` from the same release page instead.)*
2. Wait 5–15 min for it to download all 128 mods.
3. Right-click the new instance → **Edit Instance → Settings → Java → Memory → Maximum: 8 GB** (or 12 GB if you have 16+ GB system RAM).
4. **Launch.**

To get a new pack version: re-import using the new release's `.mrpack` URL. Your saves are preserved.

---

### Path B — Auto-update via packwiz (set once, sync forever)

Best if you'll play this pack regularly and want updates without re-importing.

**One-time setup:**

1. **Add Instance → Custom →** name it "Skyforge" → select **Minecraft 1.21.1** → **OK**
2. In the new instance: **Edit Instance → Version → Install NeoForge** → version **21.1.228** → close
3. Right-click instance → **Folder → Instance Folder**. Inside that folder, open `.minecraft/` (or `minecraft/`)
4. Download `packwiz-installer-bootstrap.jar` from <https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest> and drop it inside `.minecraft/`
5. Back in Prism: right-click instance → **Edit Instance → Settings → Custom Commands → tick "Custom commands"**
6. Set **Pre-launch command** to exactly this:
   ```
   "$INST_JAVA" -jar packwiz-installer-bootstrap.jar -g https://tzuae86.github.io/skyforge/pack.toml
   ```
7. **Settings → Java → Memory → 8 GB** (12 GB if you have 16+ GB RAM)
8. **Launch.**

The first launch shows a small installer window downloading the 128 mods (5–15 min). After that, every launch re-checks the manifest and syncs only what changed (~30 sec). No re-import, no re-share.

---

## Pack contents

- **Flight & physics:** Create + Create Aeronautics + Sable, Immersive Aircraft, Ritchie's Projectile Library
- **Create addons:** Steam 'n Rails, Big Cannons + AT, Diesel Generators, New Age, Connected, Copycats+, Dreams & Desires, Storage, Crafts & Additions, Ars Creo
- **Magic:** Ars Nouveau, Iron's Spells 'n Spellbooks, Forbidden & Arcanus, Reliquary, Ars 'n Spells
- **Tech:** AE2 + Advanced AE, Mekanism (+ Generators + Tools + Applied Mekanistics), Modern Industrialization, Modular Routers
- **MineColonies** + Structurize + BlockUI + Domum Ornamentum + Multi-Piston
- **Combat:** Better Combat, L_Ender's Cataclysm, Alex's Mobs (1.21.1 port), Mowzie's Mobs, Born in Chaos
- **Worldgen:** Terralith, Tectonic, Aether, Aerial Hell, Nullscape, TerraBlender, Distant Horizons
- **Structures:** Yung's Better Dungeons/Strongholds/Mineshafts, Repurposed Structures, When Dungeons Arise
- **Performance:** Sodium + Iris + Sodium Extra + Reese's, Lithium, ModernFix, FerriteCore, EntityCulling, ImmediatelyFast, Dynamic FPS, C2ME, Krypton Reno, Ksyxis, Iris+Flywheel Compat
- **Multiplayer:** Simple Voice Chat, FTB Library/Quests/Teams/Chunks
- **QoL:** EMI + JEI + JER, Xaero's Minimap + World Map, Jade, AppleSkin, Sophisticated Backpacks/Storage, Waystones, Cosmetic Armor Reworked Forked, Inventory HUD+, and more

## Performance tips

- **Allocate at least 8 GB RAM**, ideally 12 GB. 4 GB will OOM on a pack this size.
- First launch is slow — 90–180 seconds while textures, models, and recipes initialize. Subsequent launches are 30–60 seconds.
- Distant Horizons builds an LOD cache the first time you explore each chunk. Don't disable it; just be patient on the first pass.
- Pre-built `Aikar's flags` for the JVM aren't bundled — Prism applies sensible defaults but advanced users can tune them in Edit Instance → Settings → Java.

## Server connection

- Most multiplayer scenarios: ask whoever's hosting for the IP/port.
- The pack supports Simple Voice Chat — make sure UDP 24454 is open on your router/firewall.

## Troubleshooting

| Problem | Fix |
|---|---|
| `unable to open supplied modpack zip file` (Path A) | You pasted `pack.toml` URL instead of a `.mrpack` release URL. Use the [latest release](https://github.com/TZUAE86/skyforge/releases/latest) URL. |
| `OutOfMemoryError` on launch | Bump RAM in Prism Java settings. |
| First launch hangs at "Loading mods" | Normal for 2–3 min. Wait. |
| Crash with `Mod X requires Y` (Path B) | A new dep was added but not pushed yet — open an issue on this repo. |
| Voice chat doesn't connect | UDP 24454 not forwarded on your router/firewall. |

## License

See [LICENSE](LICENSE). The pack manifest itself is freely usable; individual mods retain their respective authors' licenses.
