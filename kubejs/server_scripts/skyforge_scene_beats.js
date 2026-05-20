// Skyforge — Scene Beat handler.
//
// Fires on completion of specific quest IDs (the "scene-beat" quests
// declared in the Theme Bible). Plays a sound, sends a centered title,
// appends a hidden lore entry to a per-player log readable via /skyforge lore.
//
// Event target = the quest's uppercase 16-char hex ID (per FTB Quests'
// QuestObjectBase.toString() = String.format("%016X", id)). We register
// one handler per beat quest. Inside the handler, event.notifiedPlayers
// is the list to apply effects to.
//
// All side effects wrapped in try/catch so a handler error never blocks
// the quest's reward delivery.

const SCENE_BEATS = {
    // ---- Act I — The Charter ----
    "5A11E0F101010001": {
        title: "Foreman of Fragment 0x174A",
        subtitle: "Filed.",
        color: 0xC9A24A,
        sound: "minecraft:entity.experience_orb.pickup",
        pitch: 1.4,
        lore: "Act I — The Charter. The Tablet activated. The claim is filed."
    },
    "5A11E0F10101001E": {
        title: "The Forge Site is Chosen",
        subtitle: "The fragment has a heartbeat.",
        color: 0xE08040,
        sound: "minecraft:block.bell.use",
        pitch: 1.1,
        lore: "Act I closes. A Mechanical Press stands where bare stone used to. Act II begins."
    },
    // ---- Act II — First Smoke ----
    "5A11E0F102010001": {
        title: "The Foundation Pour",
        subtitle: "Stone-bound and patient.",
        color: 0xA9B58E,
        sound: "minecraft:block.stone.place",
        pitch: 0.9,
        lore: "Act II — First Smoke. The workshop has a floor. The shaft will turn even when you sleep."
    },
    "5A11E0F102010040": {
        title: "Smoke Rises",
        subtitle: "The forge breathes.",
        color: 0xE08040,
        sound: "minecraft:block.bell.use",
        pitch: 1.0,
        lore: "Act II closes. Brass alloyed, smoker lit, the Blaze Burner is awake. Erik Brassgrip is on the next survey ship."
    },
    // ---- Act III — The Foreman ----
    "5A11E0F103010001": {
        title: "The Survey Ship Lands",
        subtitle: "Erik Brassgrip steps off.",
        color: 0xB8A06C,
        sound: "minecraft:entity.villager.yes",
        pitch: 1.0,
        lore: "Act III — The Foreman. The survey ship landed. Erik tipped his cap. The colony is filed under your name. Erik handed you a leather-bound book — the Foreman's Codex. He said every senior keeps one."
    },
    "5A11E0F103010040": {
        title: "The Colony Is Named",
        subtitle: "Erik tips his cap.",
        color: 0xE8C070,
        sound: "minecraft:block.bell.use",
        pitch: 1.2,
        lore: "Act III closes. The audit drone left a clean docket. The flag is raised. Act IV — Iron Bellows — begins on the first turn of a Steam Engine."
    },
    // ---- Act IV — Iron Bellows ----
    "5A11E0F104010001": {
        title: "The Boiler in the Yard",
        subtitle: "Steam, before the audit.",
        color: 0xB05030,
        sound: "minecraft:block.fire.ambient",
        pitch: 0.9,
        lore: "Act IV — Iron Bellows. The Steam Engine sits in the yard. The bronze tier begins on first heat."
    },
    "5A11E0F104010040": {
        title: "The First Whistle Echoes",
        subtitle: "Off the cliffs, off the cloud-banks.",
        color: 0xE08040,
        sound: "minecraft:block.bell.use",
        pitch: 0.85,
        lore: "Act IV closes. Steam, brass, electric, diesel — all on tap. Act V — Wings & Anchors — begins when the Foreman takes to the sky."
    },
    // ---- Act V — Wings & Anchors ----
    "5A11E0F105010001": {
        title: "Propeller in Hand",
        subtitle: "Sky ambitions filed.",
        color: 0x88B8E0,
        sound: "minecraft:entity.experience_orb.pickup",
        pitch: 1.2,
        lore: "Act V — Wings & Anchors. The Foreman holds a Create Aeronautics propeller. The sky is open."
    },
    "5A11E0F105010040": {
        title: "Fragment Shrinks Below",
        subtitle: "Above the cloud-bank.",
        color: 0xC0D8F0,
        sound: "minecraft:item.elytra.flying",
        pitch: 1.0,
        lore: "Act V closes. The Foreman is airborne. Act VI — Trade Routes — begins on the first Waystone placed below."
    },
    // ---- Act VI — Trade Routes ----
    "5A11E0F106010001": {
        title: "The First Waystone",
        subtitle: "The Charter signs the map.",
        color: 0x60A060,
        sound: "minecraft:block.amethyst_block.chime",
        pitch: 1.0,
        lore: "Act VI — Trade Routes. The first Waystone planted. Trade routes route through your fragment now."
    },
    "5A11E0F106010040": {
        title: "The Ledger Closes Black",
        subtitle: "First profit ledger sealed.",
        color: 0xE8D060,
        sound: "minecraft:item.book.put",
        pitch: 1.0,
        lore: "Act VI closes. The colony pays its own bills. Act VII — The Workshops — begins on the first Mekanism steel ingot."
    },
    // ---- Act VII — The Workshops ----
    "5A11E0F107010001": {
        title: "The Senior Engineer's Compendium",
        subtitle: "Third volume opened.",
        color: 0xA0A0B0,
        sound: "minecraft:item.book.put",
        pitch: 0.9,
        lore: "Act VII — The Workshops. Steel is smelted. Mekanism + AE2 + MI enter the workshop."
    },
    "5A11E0F107010040": {
        title: "The Workshops Light Up",
        subtitle: "Output: continuous.",
        color: 0xFFD060,
        sound: "minecraft:block.beacon.activate",
        pitch: 1.0,
        lore: "Act VII closes. The workshop windows burn bright at midnight. Act VIII — The Skyport — begins on the first Source Gem."
    },
    // ---- Act VIII — The Skyport ----
    "5A11E0F108010001": {
        title: "First Source Gem",
        subtitle: "Engineer's chemistry kit opens.",
        color: 0x80E0FF,
        sound: "minecraft:block.amethyst_block.chime",
        pitch: 1.4,
        lore: "Act VIII — The Skyport. The Foreman holds Source for the first time. Ars Creo bridges the workshop to the alchemist's bench."
    },
    "5A11E0F108010040": {
        title: "Warship Launch",
        subtitle: "Crew of twelve. Cargo of eight.",
        color: 0xE08040,
        sound: "minecraft:block.bell.use",
        pitch: 0.8,
        lore: "Act VIII closes. The warship rises on Source-powered lifts at sunset. Act IX — Aether's Edge — opens the Aether portal."
    },
    // ---- Act IX — Aether's Edge ----
    "5A11E0F109010001": {
        title: "The Portal Frame",
        subtitle: "Glowstone bound in a square.",
        color: 0xFFE8A0,
        sound: "minecraft:block.amethyst_cluster.place",
        pitch: 1.2,
        lore: "Act IX — Aether's Edge. The portal frame is set. The Foreman is about to cross."
    },
    "5A11E0F109010040": {
        title: "Returning with Strange Ores",
        subtitle: "Cross-dimensional cargo.",
        color: 0xD0C0E0,
        sound: "minecraft:item.book.put",
        pitch: 1.0,
        lore: "Act IX closes. Three dimensions surveyed, all Cataclysm pre-bosses cleared. Act X — The Citadel — begins on the MekaSuit helmet."
    },
    // ---- Act X — The Skyforge Citadel ----
    "5A11E0F10A010001": {
        title: "MekaSuit Helmet",
        subtitle: "The endgame opens.",
        color: 0xC0E0FF,
        sound: "minecraft:item.armor.equip_netherite",
        pitch: 1.0,
        lore: "Act X — The Skyforge Citadel. The Foreman puts on the senior engineer's helmet. Aragdal will arrive at the citadel before the audit closes."
    },
    "5A11E0F10A010035": {
        title: "The Citizens Raise a Flag",
        subtitle: "Fragment 0x174A: completed.",
        color: 0xFFD060,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Act X closes. Aragdal defeated. The pirate fleet routs. Citizens raise the colony banner above the Town Hall. The Foreman is High Foreman now. Fragment 0x174A: completed."
    },
    // ---- Act XI — The Federation ----
    "5A11E0F10B010001": {
        title: "The Charter Hands You a Map",
        subtitle: "Three fragments. Four cities. One administrator.",
        color: 0xB0D080,
        sound: "minecraft:item.book.put",
        pitch: 1.1,
        lore: "Act XI — The Federation. Three fragments reserved. Four Charter cities to visit. The Foreman administers a network now."
    },
    "5A11E0F10B010050": {
        title: "The Federation Stands",
        subtitle: "Four flags across the cloud-bank.",
        color: 0xFFE090,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 0.9,
        lore: "Act XI closes. Three player colonies, four Charter cities, four dimensional outposts — all under the Foreman's administration. The Brass Hall's invitation arrives next quarter. The Charter's Court will want to know which side."
    },
    // ---- Act XII — The Charter's Court ----
    "5A11E0F10C010001": {
        title: "Invitation to the Brass Hall",
        subtitle: "The Charter's Court convenes next week.",
        color: 0xE8C040,
        sound: "minecraft:item.book.put",
        pitch: 1.0,
        lore: "Act XII — The Charter's Court. The annual Council convenes. The Foreman attends as a provisional administrator. Cornelius Vanguard's name is on the docket."
    },
    "5A11E0F10C010030": {
        title: "The Eldritch Tide Repelled",
        subtitle: "Vanguard. The Tide. The Federation holds.",
        color: 0x6040A0,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 0.8,
        lore: "Act XII Tide closes. All four cities defended, the Architect down. Charter Councillor docket (9th, obsidian) pinned in the office. The Court Cycle opens."
    },
    "5A11E0F10C010035": {
        title: "The Council Sits",
        subtitle: "Always-on endgame.",
        color: 0xFFD840,
        sound: "minecraft:block.bell.use",
        pitch: 1.1,
        lore: "Act XII finale — the Court is in session permanently. The Foreman has work for as long as they care to take it. Quarterly cycle reset every 7+ in-game days."
    },
    // ---- Side: The Tinker's Bench ----
    "5A11E0F1B0010001": {
        title: "The Apprentice Returns to Their Bench",
        subtitle: "Copper-trimmed Engineer's Cap. The Tinker's Bench opens.",
        color: 0xC8A060,
        sound: "minecraft:block.amethyst_block.chime",
        pitch: 1.0,
        lore: "Tinker's Bench side chapter opened. Optional Create automation deep-dive. The Charter doesn't audit it; the senior mechanics know each other by sight."
    },
    "5A11E0F1B001001E": {
        title: "The Tinker's Bench",
        subtitle: "Every Create concept on one fragment.",
        color: 0xE0B070,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Tinker's Bench complete. Sequenced Assembly + bulk processing + contraptions + Item Vaults + decoration — all live in the workshop. The Foreman is a senior mechanic now."
    },
    // ---- Side: The Project Docket ----
    "5A11E0F1C0010001": {
        title: "The Project Docket Opened",
        subtitle: "Erik hands you the senior engineer's clipboard.",
        color: 0xC8A060,
        sound: "minecraft:item.book.page_turn",
        pitch: 1.0,
        lore: "Project Docket opened. Thirty automation projects, no required order. Tick any page once the automation is built. The Charter trusts the Foreman's signature."
    },
    "5A11E0F1C0010031": {
        title: "The Project Docket Filed",
        subtitle: "Project Manager. The brass clip is yours.",
        color: 0xE8C070,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Project Docket filed — 25 of 30 automation pages ticked. The Charter's clerk has the inventory. The Foreman is a Project Manager now; the eleventh docket goes on the office wall, brass-trimmed."
    },
    // ---- Side: The Tavern's Cellar ----
    "5A11E0F1D0010001": {
        title: "The Cellar Opens",
        subtitle: "Twelve recipes between you and respectability.",
        color: 0x8B4513,
        sound: "minecraft:block.barrel.open",
        pitch: 1.0,
        lore: "Tavern's Cellar opened. The Charter taxes liquor at the dock and looks the other way at the brewing. A senior Foreman's cellar is, by tradition, a Charter landmark."
    },
    "5A11E0F1D001000C": {
        title: "Cellarmaster",
        subtitle: "Wax the colour of a good stout.",
        color: 0xE8C070,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Cellarmaster. The tavern is open for business. The Charter clerk drops by more often than the docket strictly requires."
    },
    // ---- Side: The Charter's Kitchen ----
    "5A11E0F1E0010001": {
        title: "The Kitchen Opens",
        subtitle: "Twelve dishes to a Charter dinner.",
        color: 0xC8A060,
        sound: "minecraft:block.lantern.place",
        pitch: 1.0,
        lore: "Charter's Kitchen opened. The senior Foreman feeds the Charter back. A good kitchen is, by old-Charter tradition, a defensible kitchen."
    },
    "5A11E0F1E001000C": {
        title: "The Senior Cook",
        subtitle: "The audit clerk wipes her plate. Signs the form.",
        color: 0xE8C070,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Senior Cook. A small line at the bottom of the audit form reads 'Cook.' The clerk visits twice a quarter now."
    },
    // ---- Side: Per Spatium ----
    "5A11E0F1F0010001": {
        title: "The Surveyor's Folly",
        subtitle: "The sky above the sky.",
        color: 0x88A0E0,
        sound: "minecraft:entity.experience_orb.pickup",
        pitch: 1.3,
        lore: "Per Spatium opened. There is a sky above the sky. The Charter's maps stop at the Aether's Edge; yours don't."
    },
    "5A11E0F1F001000C": {
        title: "The Charter of the Stars",
        subtitle: "Blank wax. No precedent.",
        color: 0xFFFFFF,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 0.8,
        lore: "Astronaut. The Charter has no precedent for the colour of the wax. The frontier has no further edge that you have not, personally, reached."
    },
    // ---- Side: Decoration Mastery ----
    "5A11E0F1D1010001": {
        title: "The Folio Opens",
        subtitle: "Beautiful blocks. Framed views.",
        color: 0xC8A060,
        sound: "minecraft:item.book.page_turn",
        pitch: 1.0,
        lore: "Decoration Mastery opened. Anyone can build a wall. A Foreman builds a wall the Charter clerk wants to draw."
    },
    "5A11E0F1D101000C": {
        title: "Senior Architect",
        subtitle: "Copper-silver alloy, etched.",
        color: 0xE8C070,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Senior Architect. The Charter clerk requests a tea date. The colony is beautiful. The audit is favourable."
    },
    // ---- Act XIII — The Foreman's Encore ----
    "5A11E0F10D010001": {
        title: "The Council's Letter",
        subtitle: "Black wax, brass-trimmed.",
        color: 0xC9A24A,
        sound: "minecraft:block.bell.use",
        pitch: 1.1,
        lore: "Act XIII — The Foreman's Encore. The Brass Hall convened in your absence. Your seat is kept. The Charter has a great deal of unfiled work. Yours, if you want it."
    },
    "5A11E0F10D01000A": {
        title: "The Encore Filed",
        subtitle: "Etched copper-silver. Not in the public ledger.",
        color: 0xE8C070,
        sound: "minecraft:ui.toast.challenge_complete",
        pitch: 1.0,
        lore: "Encore filed. The senior chair at the Brass Hall is, formally, yours. The clerks rise when you enter the room."
    }
};

function fireSceneBeat(player, beat, qid) {
    if (!player || !beat) return;
    var hexColor = '#' + beat.color.toString(16).padStart(6, '0');
    try {
        player.playNotifySound(beat.sound, 'master', 1.0, beat.pitch);
    } catch (e) {
        console.error('[Skyforge] beat sound failed: ' + e);
    }
    try {
        player.runCommandSilent('title @s times 10 60 20');
        player.runCommandSilent('title @s subtitle {"text":"' + beat.subtitle + '","color":"' + hexColor + '"}');
        player.runCommandSilent('title @s title {"text":"' + beat.title + '","color":"' + hexColor + '","bold":true}');
    } catch (e) {
        console.error('[Skyforge] beat title failed: ' + e);
    }
    try {
        var server = player.server;
        var raw = server.persistentData.getString('skyforge_lore');
        var lore = (raw && raw.length > 0) ? JSON.parse(raw) : {};
        var uuid = player.uuid.toString();
        if (!lore[uuid]) lore[uuid] = [];
        lore[uuid].push({ ts: Date.now(), text: beat.lore, qid: qid });
        server.persistentData.putString('skyforge_lore', JSON.stringify(lore));
    } catch (e) {
        console.error('[Skyforge] beat lore log failed: ' + e);
    }
}

// Register one handler per scene-beat quest.
Object.keys(SCENE_BEATS).forEach(function(qid) {
    FTBQuestsEvents.completed(qid, function(event) {
        try {
            var beat = SCENE_BEATS[qid];
            var players = event.notifiedPlayers;
            for (var i = 0; i < players.size(); i++) {
                fireSceneBeat(players.get(i), beat, qid);
            }
        } catch (e) {
            console.error('[Skyforge] scene-beat ' + qid + ' failed: ' + e);
        }
    });
});

console.info('[Skyforge] scene-beat handlers registered for ' + Object.keys(SCENE_BEATS).length + ' quests');

// ---- /skyforge lore — show per-player log ----
ServerEvents.commandRegistry(function(event) {
    try {
        var Commands = event.commands;
        event.register(
            Commands.literal('skyforge')
                .then(Commands.literal('lore').executes(function(ctx) {
                    try {
                        var player = ctx.source.playerOrException;
                        var raw = player.server.persistentData.getString('skyforge_lore');
                        var lore = (raw && raw.length > 0) ? JSON.parse(raw) : {};
                        var entries = lore[player.uuid.toString()] || [];
                        if (entries.length === 0) {
                            player.tell('§7No lore entries yet, Foreman.');
                        } else {
                            player.tell('§6=== Skyforge Lore Log ===');
                            for (var i = 0; i < entries.length; i++) {
                                player.tell('§e• §f' + entries[i].text);
                            }
                        }
                        return 1;
                    } catch (e) {
                        console.error('[Skyforge] /skyforge lore failed: ' + e);
                        return 0;
                    }
                }))
        );
    } catch (e) {
        console.error('[Skyforge] command registration failed: ' + e);
    }
});
