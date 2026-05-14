// Skyforge — Challenge quest detection helpers.
//
// Detection for non-trivial challenge quests that FTB Quests' built-in
// task types can't model directly:
//   - throughput: produce N items in M seconds (inventory polling)
//   - no-craft survival: survive M seconds without crafting anything
//   - waypoint flight: visit N coords in order within M seconds
//
// Act I doesn't use any of these — they enter in Acts IV–VI. This file
// ships in Turn 1a as the framework so later acts can plug in.
//
// All side effects wrapped in try/catch so a handler error never blocks
// quest rewards. Active challenges are tracked in server.persistentData
// so they survive restarts.

const CHALLENGE_TICK_HZ = 20; // poll once per second

// challenge_id -> definition
const CHALLENGES = {
    // Example registration (commented out — enable when Act IV ships):
    // "iron_60_per_min_for_5min": {
    //     kind: "throughput",
    //     item: "minecraft:iron_ingot",
    //     target: 300,
    //     window_sec: 300,
    //     onComplete: player => player.runCommandSilent(`ftbquests complete <quest_id>`)
    // }
};

function getActive(server) {
    try {
        const raw = server.persistentData.getString("skyforge_challenges");
        if (!raw || raw.length === 0) return {};
        return JSON.parse(raw);
    } catch (e) {
        console.error("[Skyforge] active challenges load failed: " + e);
        return {};
    }
}

function setActive(server, active) {
    try {
        server.persistentData.putString("skyforge_challenges", JSON.stringify(active));
    } catch (e) {
        console.error("[Skyforge] active challenges save failed: " + e);
    }
}

function countItemInInventory(player, itemId) {
    try {
        let total = 0;
        const inv = player.inventory;
        const size = inv.containerSize;
        for (let i = 0; i < size; i++) {
            const stack = inv.getItem(i);
            if (!stack || stack.isEmpty()) continue;
            if (stack.id == itemId) total += stack.count;
        }
        return total;
    } catch (e) {
        console.error("[Skyforge] inventory scan failed: " + e);
        return 0;
    }
}

// Public-ish helper. Modern KubeJS forbids writing to `global`, so we
// keep this as a file-scoped function. To call it from another server
// script, copy the function or re-implement; cross-script sharing is
// rare enough not to be worth a proper binding for Turn 2.
function skyforgeStartChallenge(player, challengeId) {
    try {
        const def = CHALLENGES[challengeId];
        if (!def) {
            console.warn("[Skyforge] unknown challenge: " + challengeId);
            return false;
        }
        const server = player.server;
        const active = getActive(server);
        const key = player.uuid.toString() + ":" + challengeId;
        const baseline = def.kind === "throughput"
            ? countItemInInventory(player, def.item)
            : 0;
        active[key] = {
            startedAt: Date.now(),
            baseline: baseline,
            kind: def.kind,
            challengeId: challengeId
        };
        setActive(server, active);
        player.tell("§e[Charter] Challenge started: §f" + challengeId);
        return true;
    } catch (e) {
        console.error("[Skyforge] startChallenge failed: " + e);
        return false;
    }
}

// Server tick: poll every CHALLENGE_TICK_HZ ticks
let tickCounter = 0;
ServerEvents.tick(event => {
    try {
        tickCounter++;
        if (tickCounter < CHALLENGE_TICK_HZ) return;
        tickCounter = 0;

        const server = event.server;
        const active = getActive(server);
        if (Object.keys(active).length === 0) return;

        const now = Date.now();
        let dirty = false;

        for (const key in active) {
            const c = active[key];
            const def = CHALLENGES[c.challengeId];
            if (!def) {
                delete active[key];
                dirty = true;
                continue;
            }
            const elapsedSec = (now - c.startedAt) / 1000;
            const uuid = key.split(":")[0];
            const player = server.players.find(p => p.uuid.toString() == uuid);
            if (!player) continue;

            if (def.kind === "throughput") {
                const current = countItemInInventory(player, def.item);
                const produced = current - c.baseline;
                if (produced >= def.target) {
                    player.tell("§a[Charter] Challenge passed: §f" + c.challengeId);
                    if (def.onComplete) def.onComplete(player);
                    delete active[key];
                    dirty = true;
                } else if (elapsedSec >= def.window_sec) {
                    player.tell("§c[Charter] Challenge expired: §f" + c.challengeId);
                    delete active[key];
                    dirty = true;
                }
            }
            // no-craft and waypoint kinds wired in when Acts IV-VI land
        }

        if (dirty) setActive(server, active);
    } catch (e) {
        console.error("[Skyforge] challenge tick crashed: " + e);
    }
});
