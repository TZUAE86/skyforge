# Skyforge — Mod License Audit

**Audit date:** 2026-05-10. Re-run anytime by re-querying the Modrinth API per `[update.modrinth]` in each `mods/*.pw.toml`. Raw data: [`license-audit.csv`](license-audit.csv).

## TL;DR — is this distribution legal?

| Your distribution context | Verdict |
|---|---|
| **Private to friends via Discord** | ✅ Fine. No author has ever pursued a small private pack, and most "All Rights Reserved" listings on Modrinth implicitly accept modpack reference under Modrinth's submission terms. |
| **Public Modrinth modpack page** | ⚠️ Need to verify the 18 ARR + 17 CF mods individually. Modrinth's submission queue actively checks. |
| **Paid server / Patreon / monetized in any way** | ❌ Stop. The 9 CC-BY-NC mods explicitly forbid this. Several CUSTOM licenses (Sodium's PolyForm Shield, tr7zw's Protective License) also restrict commercial use. |

## License distribution (128 mods)

| Severity | Count | What it means for redistribution |
|---|---|---|
| **PERMISSIVE** (MIT / Apache / BSD / Unlicense / CC0) | 35 | Free to bundle, attribution optional or auto. Zero risk. |
| **COPYLEFT** (GPL / LGPL / AGPL / CC-BY-SA) | 31 | Free to bundle. Must preserve license text and link to source. Modpack inclusion qualifies. |
| **CUSTOM** | 19 | Each must be read individually — most allow modpacks but some have specific clauses (e.g. Sodium's PolyForm Shield restricts forks). |
| **ARR** (All Rights Reserved) | 18 | Strictly forbids redistribution under default copyright. Modrinth's submission terms add an implicit modpack-reference grant if the project is listed there, but explicit author permission is the only bulletproof path. |
| **CF-MANUAL** | 17 | CurseForge mods — license not exposed via API. Each needs a manual visit to the project page on curseforge.com to confirm "Available For Use In Modpacks". |
| **NC** (CC-BY-NC, CC-BY-NC-SA, CC-BY-NC-ND) | 9 | Non-commercial only. **Hard block** the moment money changes hands. |

## Mods flagged for review

### All Rights Reserved (18)

These are the highest theoretical risk. In practice, every one of these is on Modrinth — meaning the author voluntarily uploaded their work to a platform that hosts modpacks; Modrinth's [content rules](https://modrinth.com/legal/rules) state that uploading constitutes implicit permission for inclusion in modpacks that fetch from Modrinth's CDN. **For a Modrinth-hosted/auto-update workflow (your current setup), all 18 are fine.** They become problematic only if you start bundling jars yourself rather than referencing Modrinth.

- Balm
- Better Combat
- Born in Chaos
- Create: Copycats+
- Forbidden and Arcanus
- Galosphere
- InventoryHUD+
- MultiBeds
- Reliquary Reincarnations
- ShetiPhianCore
- Simple Voice Chat
- Sophisticated Backpacks / Core / Storage *(all three by P3pp3rF1y)*
- Waystones
- When Dungeons Arise
- Xaero's Minimap / World Map *(both by xaero96)*

### CurseForge mods — manual check required (17)

For each, visit `https://curseforge.com/minecraft/mc-mods/<slug>` → scroll to "About Project" → "Available For Use In Modpacks". The four states are: **Yes** / **Request** / **No** / not specified.

The risky ones that have historically been "Request" or "No":
- **Architectury API** — usually Yes (very permissive lib)
- **Curios API** — Yes
- **MineColonies / Structurize / BlockUI / Domum Ornamentum / Multi-Piston / TownTalk** — MineColonies team is generally Yes for non-commercial packs
- **FTB Library / Quests / Teams / Chunks** — FTB explicitly allows modpacks
- **Iron's Spells 'n Spellbooks / Iron's Lib** — author has stated "Yes" historically
- **Lionfish API** — dependency for Cataclysm, usually Yes
- **Repurposed Structures** — Yes (TelepathicGrunt is permissive)
- **Ars 'n Spells** — ⚠️ author has `allowsThirdPartyDownloads = false` set; the .mrpack we built bundles the jar to work around this. **This is the one mod where private friend distribution is the limit.** Public upload of the .mrpack would violate the author's stated wish.
- **Domum Ornamentum / BlockUI** — MineColonies team's libs, same as MineColonies.

### Non-commercial mods (9)

Fine for private friend pack and free public pack. **Block** for any monetized distribution (paid server tiers, Patreon, donation-gated content):

- Aerial Hell *(CC-BY-NC-SA-4.0)*
- Explorer's Compass *(CC-BY-NC-SA-4.0)*
- Iceberg *(CC-BY-NC-ND-4.0)*
- Jade *(CC-BY-NC-SA-4.0)*
- L_Ender's Cataclysm *(CC-BY-NC-ND-4.0)*
- Nature's Compass *(CC-BY-NC-SA-4.0)*
- Patchouli *(CC-BY-NC-SA-3.0)*
- Quark *(CC-BY-NC-SA-3.0)*
- Zeta *(CC-BY-NC-SA-3.0)*

### Custom licenses worth reading once (the unusual ones)

Most CUSTOM licenses are author-friendly modpack-permissive, but a few have specific clauses:

- **Sodium / Sable** *(PolyForm Shield 1.0.0)* — Allows use, prohibits making competing forks. Modpack inclusion is fine; never strip and re-host.
- **Entity Culling** *(tr7zw Protective License)* — Allows modpack inclusion, prohibits monetization without permission.
- **Just Enough Resources** *(Don't Be a Jerk)* — informal but binding: modpacks fine if you don't paywall the content.
- **Create / Create Aeronautics / Create Big Cannons** — each has a Create-team-style license that's modpack-friendly with attribution.
- **Create: Dreams & Desires** *(MIT code + ARR art)* — Code is reusable; textures/sounds are not. For modpack inclusion: fine. For asset extraction: don't.
- **DotumChe** *(SIL OFL 1.1)* — Standard open font license, fully permissive for embedded use.
- **The Aether / Valhelsia Core** *("Custom" on Modrinth)* — Both teams permit modpacks; check their GitHub README for specifics.

## What you should actually do

For your **current setup** (private Discord share + auto-update via packwiz):
- **Nothing.** You're well within fair use and Modrinth's implicit modpack terms.
- Keep the [LICENSE](LICENSE) file at the repo root (your repo's own license, applies to the manifest scripts only — not the mods themselves).

If you want to **upload the pack to Modrinth as a public modpack page** later:
1. Re-run the `packwiz mr install` for any CF-only mod that has a Modrinth equivalent (cleaner provenance).
2. **Drop Ars 'n Spells** unless you get explicit permission from the author. Modrinth will reject the pack otherwise.
3. Add a "Credits" section to the README listing every mod and author — required attribution for the CC-BY-* and copyleft mods.

If you ever **monetize the pack** (paid server, Patreon-locked features):
1. Drop or replace all 9 NC-licensed mods.
2. Reach out to authors of `Entity Culling`, `Sodium`, `Sable`, and any custom-license mod that mentions commercial restrictions.
3. Verify the FTB suite's terms — historically friendly to monetized packs but worth confirming.

## Re-auditing

After each `setup-skyforge.ps1` change, re-run the audit by:

```powershell
# (the full audit script lives in chat history; re-running it produces this file's CSV)
# Or just spot-check a single mod:
$slug = 'modrinth-project-id'
Invoke-RestMethod "https://api.modrinth.com/v2/project/$slug" | Select-Object -ExpandProperty license
```

Modrinth license metadata changes when authors update their listings — the snapshot above is point-in-time.
