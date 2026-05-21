// Skyforge — Office Wall + Codex advancement-gating.
//
// Two coupled features:
//   1. /skyforge office — show the player's 12 senior-Foreman dockets
//      in chat (earned vs missing). Storage in player.persistentData.
//   2. Codex advancement-gating — Patchouli entries are gated behind
//      six grouped advancements; this file grants them when the
//      relevant scene-beat quests fire.
//
// Rhino-safe: classic function() + var; no arrow, no const/let.

// ---- DOCKET TABLE: the 12 office-wall dockets (verified IDs) ----
var DOCKET_BEATS = {
    "5A11E0F101010001": { num: 1,  name: "Foreman of Record" },
    "5A11E0F102010040": { num: 2,  name: "First Smoke Filed" },
    "5A11E0F103010040": { num: 3,  name: "Builder of Record",      tag: "Erik signs" },
    "5A11E0F104010040": { num: 4,  name: "Iron Bellows Operator" },
    "5A11E0F105010040": { num: 5,  name: "Sky Wright" },
    "5A11E0F106010040": { num: 6,  name: "Federation Liaison" },
    "5A11E0F107010040": { num: 7,  name: "Workshop Foreman" },
    "5A11E0F108010040": { num: 8,  name: "Sky Captain" },
    "5A11E0F109010040": { num: 9,  name: "Frontier Engineer" },
    "5A11E0F10A010035": { num: 10, name: "Citadel Witness" },
    "5A11E0F10B010050": { num: 11, name: "Brass Hall Councilor" },
    "5A11E0F1C0010031": { num: 12, name: "Project Manager",        tag: "brass-trimmed" }
};

// ---- CODEX ADVANCEMENT TRIGGERS: which quest grants which gate ----
var CODEX_TRIGGERS = {
    "5A11E0F101010001": "skyforge:codex_foundations",     // Act I Q1
    "5A11E0F103010004": "skyforge:codex_workshop",        // Act III Q4 (Erik's hut)
    "5A11E0F105010040": "skyforge:codex_federation",      // Act V finale (sky trade opens)
    "5A11E0F109010001": "skyforge:codex_endgame",         // Act IX opener (Aether's Edge)
    "5A11E0F10B010001": "skyforge:codex_diplomacy",       // Act XI opener (Charter map)
    "5A11E0F10C010001": "skyforge:codex_crisis"           // Act XII opener (Brass Hall invite)
};

// ---- BACKFILL PATTERNS: detect dockets from legacy lore-log entries ----
// Short distinctive substring per docket; matched against lore entry text
// when the entry lacks a qid (entries from before this code shipped).
var BACKFILL_PATTERNS = [
    { num: 1,  match: "Foreman of Fragment" },
    { num: 2,  match: "Smoke Rises" },
    { num: 3,  match: "Erik tips his cap" },
    { num: 4,  match: "First Whistle" },
    { num: 5,  match: "Fragment Shrinks Below" },
    { num: 6,  match: "Ledger Closes Black" },
    { num: 7,  match: "Workshops Light Up" },
    { num: 8,  match: "Warship Launch" },
    { num: 9,  match: "Strange Ores" },
    { num: 10, match: "Citizens Raise a Flag" },
    { num: 11, match: "Federation Stands" },
    { num: 12, match: "Project Docket filed" }
];

// Hash of the DOCKET_BEATS table for cache invalidation when this file changes.
var OFFICE_TABLE_HASH = "v1-12dockets-2026-05-16";

// ---- Helpers ----
function readOffice(player) {
    var pd = player.persistentData;
    var hash = pd.getString('skyforge_office_hash');
    if (hash !== OFFICE_TABLE_HASH) {
        return null;
    }
    var raw = pd.getString('skyforge_office');
    if (!raw || raw.length === 0) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function writeOffice(player, dockets) {
    var pd = player.persistentData;
    pd.putString('skyforge_office', JSON.stringify(dockets));
    pd.putString('skyforge_office_hash', OFFICE_TABLE_HASH);
}

function addDocket(player, num) {
    var dockets = readOffice(player);
    if (dockets === null) dockets = [];
    for (var i = 0; i < dockets.length; i++) {
        if (dockets[i] === num) return false;
    }
    dockets.push(num);
    dockets.sort(function(a, b) { return a - b; });
    writeOffice(player, dockets);
    return true;
}

function backfillFromLore(player) {
    var dockets = [];
    try {
        var raw = player.server.persistentData.getString('skyforge_lore');
        if (!raw || raw.length === 0) return dockets;
        var lore = JSON.parse(raw);
        var uuid = player.uuid.toString();
        var entries = lore[uuid] || [];
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            // Path 1: entry has qid (post-v0.8.1) — exact match
            if (entry.qid && DOCKET_BEATS[entry.qid]) {
                var num = DOCKET_BEATS[entry.qid].num;
                if (dockets.indexOf(num) === -1) dockets.push(num);
                continue;
            }
            // Path 2: legacy text matching
            for (var j = 0; j < BACKFILL_PATTERNS.length; j++) {
                var pat = BACKFILL_PATTERNS[j];
                if (entry.text && entry.text.indexOf(pat.match) !== -1) {
                    if (dockets.indexOf(pat.num) === -1) dockets.push(pat.num);
                    break;
                }
            }
        }
    } catch (e) {
        console.error('[Skyforge] office backfill failed: ' + e);
    }
    dockets.sort(function(a, b) { return a - b; });
    return dockets;
}

function getDocketsOrBackfill(player) {
    var dockets = readOffice(player);
    if (dockets === null || dockets.length === 0) {
        dockets = backfillFromLore(player);
        writeOffice(player, dockets);
    }
    return dockets;
}

// ---- FTBQuestsEvents.completed: mark dockets + grant codex advancements ----
Object.keys(DOCKET_BEATS).forEach(function(qid) {
    FTBQuestsEvents.completed(qid, function(event) {
        try {
            var docket = DOCKET_BEATS[qid];
            var players = event.notifiedPlayers;
            for (var i = 0; i < players.size(); i++) {
                addDocket(players.get(i), docket.num);
            }
        } catch (e) {
            console.error('[Skyforge] office docket ' + qid + ' failed: ' + e);
        }
    });
});

Object.keys(CODEX_TRIGGERS).forEach(function(qid) {
    FTBQuestsEvents.completed(qid, function(event) {
        try {
            var adv = CODEX_TRIGGERS[qid];
            var players = event.notifiedPlayers;
            for (var i = 0; i < players.size(); i++) {
                var p = players.get(i);
                p.runCommandSilent('advancement grant @s only ' + adv);
            }
        } catch (e) {
            console.error('[Skyforge] codex advancement ' + qid + ' failed: ' + e);
        }
    });
});

console.info('[Skyforge] office wall: 12 dockets armed, 6 codex gates armed');

// ---- /skyforge office subcommand ----
ServerEvents.commandRegistry(function(event) {
    try {
        var Commands = event.commands;
        event.register(
            Commands.literal('skyforge')
                .then(Commands.literal('office').executes(function(ctx) {
                    try {
                        var player = ctx.source.playerOrException;
                        var dockets = getDocketsOrBackfill(player);
                        player.tell('§6=== The Office Wall ===');
                        // Iterate the table in docket-number order
                        var ordered = [];
                        for (var qid in DOCKET_BEATS) {
                            ordered.push(DOCKET_BEATS[qid]);
                        }
                        ordered.sort(function(a, b) { return a.num - b.num; });
                        for (var i = 0; i < ordered.length; i++) {
                            var d = ordered[i];
                            var earned = dockets.indexOf(d.num) !== -1;
                            var pad = d.num < 10 ? '  ' : ' ';
                            var line;
                            if (earned) {
                                line = '§e§l' + pad + d.num + '. §a§l✓§r §f' + d.name;
                            } else {
                                line = '§e§l' + pad + d.num + '. §7§l☐§r §8' + d.name;
                            }
                            if (d.tag) {
                                line = line + ' §7(' + d.tag + ')';
                            }
                            player.tell(line);
                        }
                        player.tell('§7Earned: §e' + dockets.length + ' of ' + ordered.length + '§7. The Charter notes the progress.');
                        return 1;
                    } catch (e) {
                        console.error('[Skyforge] /skyforge office failed: ' + e);
                        return 0;
                    }
                }))
        );
    } catch (e) {
        console.error('[Skyforge] office command registration failed: ' + e);
    }
});
