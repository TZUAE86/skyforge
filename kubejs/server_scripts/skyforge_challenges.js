// Skyforge — Challenge quest detection helpers.
//
// Detection for non-trivial challenge quests that FTB Quests' built-in
// task types can't model directly:
//   - throughput: produce N items in M seconds (inventory polling)
//   - no-craft survival: survive M seconds without crafting anything
//   - waypoint flight: visit N coords in order within M seconds
//
// Act I doesn't use any of these — they enter in Acts IV–VI. This file
// ships as the framework so later acts can plug in.
//
// Rhino-safe: classic function() + var; no arrow bodies, no const/let.
// Rhino on KubeJS hoists const/let to script scope, so a `const srv` inside
// an event-handler arrow body re-declares once per tick → log spam.
//
// All side effects wrapped in try/catch so a handler error never blocks
// quest rewards. Active challenges are tracked in server.persistentData
// so they survive restarts.

var CHALLENGE_TICK_HZ = 20; // poll once per second

// challenge_id -> definition
var CHALLENGES = {
    // Example registration (commented out — enable when Act IV ships):
    // "iron_60_per_min_for_5min": {
    //     kind: "throughput",
    //     item: "minecraft:iron_ingot",
    //     target: 300,
    //     window_sec: 300,
    //     onComplete: function(player) { player.runCommandSilent('ftbquests complete <quest_id>'); }
    // }
};

function getActive(srv) {
    try {
        var raw = srv.persistentData.getString("skyforge_challenges");
        if (!raw || raw.length === 0) return {};
        return JSON.parse(raw);
    } catch (e) {
        console.error("[Skyforge] active challenges load failed: " + e);
        return {};
    }
}

function setActive(srv, active) {
    try {
        srv.persistentData.putString("skyforge_challenges", JSON.stringify(active));
    } catch (e) {
        console.error("[Skyforge] active challenges save failed: " + e);
    }
}

function countItemInInventory(player, itemId) {
    try {
        var total = 0;
        var inv = player.inventory;
        var size = inv.containerSize;
        for (var i = 0; i < size; i++) {
            var stack = inv.getItem(i);
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
// rare enough not to be worth a proper binding for now.
function skyforgeStartChallenge(player, challengeId) {
    try {
        var def = CHALLENGES[challengeId];
        if (!def) {
            console.warn("[Skyforge] unknown challenge: " + challengeId);
            return false;
        }
        var srv = player.server;
        var active = getActive(srv);
        var key = player.uuid.toString() + ":" + challengeId;
        var baseline = def.kind === "throughput"
            ? countItemInInventory(player, def.item)
            : 0;
        active[key] = {
            startedAt: Date.now(),
            baseline: baseline,
            kind: def.kind,
            challengeId: challengeId
        };
        setActive(srv, active);
        player.tell("§e[Charter] Challenge started: §f" + challengeId);
        return true;
    } catch (e) {
        console.error("[Skyforge] startChallenge failed: " + e);
        return false;
    }
}

// Server tick: poll every CHALLENGE_TICK_HZ ticks
var tickCounter = 0;
ServerEvents.tick(function(event) {
    try {
        tickCounter++;
        if (tickCounter < CHALLENGE_TICK_HZ) return;
        tickCounter = 0;

        var srv = event.server;
        var active = getActive(srv);
        if (Object.keys(active).length === 0) return;

        var now = Date.now();
        var dirty = false;

        for (var key in active) {
            var c = active[key];
            var def = CHALLENGES[c.challengeId];
            if (!def) {
                delete active[key];
                dirty = true;
                continue;
            }
            var elapsedSec = (now - c.startedAt) / 1000;
            var uuid = key.split(":")[0];
            var player = null;
            var players = srv.players;
            for (var i = 0; i < players.size(); i++) {
                var p = players.get(i);
                if (p.uuid.toString() == uuid) { player = p; break; }
            }
            if (!player) continue;

            if (def.kind === "throughput") {
                var current = countItemInInventory(player, def.item);
                var produced = current - c.baseline;
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

        if (dirty) setActive(srv, active);
    } catch (e) {
        console.error("[Skyforge] challenge tick crashed: " + e);
    }
});
