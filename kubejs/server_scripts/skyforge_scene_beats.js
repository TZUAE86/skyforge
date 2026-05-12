// Skyforge — Scene Beat handler.
//
// Fires on completion of specific quest IDs (the "scene-beat" quests
// declared in the Theme Bible). Plays a sound, sends a centered title,
// appends a hidden lore entry to a per-player log readable via /skyforge lore.
//
// All side effects wrapped in try/catch so a handler error never blocks
// the quest's reward delivery.

// quest_id -> { title, subtitle, color (TextColor argb), sound, pitch, lore }
const SCENE_BEATS = {
    // Act I — The Charter
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
    }
};

const LORE_FILE = "skyforge/lore_log.json";

function loadLore(server) {
    try {
        const data = server.persistentData;
        const raw = data.getString("skyforge_lore");
        if (!raw || raw.length === 0) return {};
        return JSON.parse(raw);
    } catch (e) {
        console.error("[Skyforge] Failed to load lore log: " + e);
        return {};
    }
}

function saveLore(server, lore) {
    try {
        server.persistentData.putString("skyforge_lore", JSON.stringify(lore));
    } catch (e) {
        console.error("[Skyforge] Failed to save lore log: " + e);
    }
}

FTBQuestsEvents.completed("ftbquests:quest", event => {
    try {
        const beat = SCENE_BEATS[event.quest.id];
        if (!beat) return;

        const player = event.player;
        if (!player) return;

        // 1. Sound
        try {
            player.playNotifySound(beat.sound, "master", 1.0, beat.pitch);
        } catch (e) {
            console.error("[Skyforge] scene-beat sound failed: " + e);
        }

        // 2. Centered title
        try {
            player.runCommandSilent(
                `title @s times 10 60 20`
            );
            player.runCommandSilent(
                `title @s subtitle {"text":"${beat.subtitle}","color":"#${beat.color.toString(16).padStart(6, "0")}"}`
            );
            player.runCommandSilent(
                `title @s title {"text":"${beat.title}","color":"#${beat.color.toString(16).padStart(6, "0")}","bold":true}`
            );
        } catch (e) {
            console.error("[Skyforge] scene-beat title failed: " + e);
        }

        // 3. Lore log
        try {
            const server = player.server;
            const lore = loadLore(server);
            const key = player.uuid.toString();
            if (!lore[key]) lore[key] = [];
            lore[key].push({
                quest: event.quest.id,
                ts: Date.now(),
                text: beat.lore
            });
            saveLore(server, lore);
        } catch (e) {
            console.error("[Skyforge] scene-beat lore log failed: " + e);
        }
    } catch (e) {
        console.error("[Skyforge] scene-beat handler crashed: " + e);
    }
});

// /skyforge lore  -> prints the per-player log to chat
ServerEvents.commandRegistry(event => {
    try {
        const { commands: Commands, arguments: Arguments } = event;
        event.register(
            Commands.literal("skyforge")
                .then(Commands.literal("lore").executes(ctx => {
                    try {
                        const player = ctx.source.playerOrException;
                        const lore = loadLore(player.server);
                        const entries = lore[player.uuid.toString()] || [];
                        if (entries.length === 0) {
                            player.tell("§7No lore entries yet, Foreman.");
                        } else {
                            player.tell("§6=== Skyforge Lore Log ===");
                            for (const e of entries) {
                                player.tell("§e• §f" + e.text);
                            }
                        }
                        return 1;
                    } catch (e) {
                        console.error("[Skyforge] /skyforge lore failed: " + e);
                        return 0;
                    }
                }))
        );
    } catch (e) {
        console.error("[Skyforge] command registration failed: " + e);
    }
});
