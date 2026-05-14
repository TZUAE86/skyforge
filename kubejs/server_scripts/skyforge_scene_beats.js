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
        lore: "Act III — The Foreman. The survey ship landed. Erik tipped his cap. The colony is filed under your name."
    },
    "5A11E0F103010040": {
        title: "The Colony Is Named",
        subtitle: "Erik tips his cap.",
        color: 0xE8C070,
        sound: "minecraft:block.bell.use",
        pitch: 1.2,
        lore: "Act III closes. The audit drone left a clean docket. The flag is raised. Act IV — Iron Bellows — begins on the first turn of a Steam Engine."
    }
};

function fireSceneBeat(player, beat) {
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
        lore[uuid].push({ ts: Date.now(), text: beat.lore });
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
                fireSceneBeat(players.get(i), beat);
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
