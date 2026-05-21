// Skyforge — FTB Quests custom-task handlers.
//
// FTB Quests' built-in "item" task cannot match item tags (e.g.
// #minecraft:logs) without the Item Filters mod, which has no 1.21.1
// NeoForge port. The workaround is a CustomTask whose check is
// registered from KubeJS — fires every checkTimer ticks for each
// player and updates progress.
//
// Event-ID format: FTBQuestsEvents.customTask(<hex>, ...) where
// <hex> is QuestObjectBase.toString() == String.format("%016X", id) —
// UPPERCASE, exactly 16 chars, leading zeros. The task ID in the
// chapter .snbt must match the registration string exactly.
//
// Rhino-in-KubeJS quirk: use classic `function()` syntax and `var`
// inside the check body. Arrow functions + let/const inside a check
// invoked repeatedly will throw "redeclaration of var X" because
// Rhino re-runs the body in a shared scope between calls.

var LOGS_INGREDIENT = Ingredient.of('#minecraft:logs');
var skyforge_q3_check_logged = false;

// ---- Q03 (Act I, "First Light"): 16 logs of any wood type ----
FTBQuestsEvents.customTask('5A11E0F101020003', function(event) {
    try {
        event.setMaxProgress(16);
        event.setCheckTimer(40); // 2 s polling
        event.setEnableButton(true); // manual complete button as a safety net
        event.setCheck(function(task, player) {
            try {
                var total = 0;
                var playerInv = player.inventory;
                var size = playerInv.containerSize;
                for (var i = 0; i < size; i++) {
                    var stack = playerInv.getItem(i);
                    if (stack && !stack.isEmpty() && LOGS_INGREDIENT.test(stack)) {
                        total += stack.count;
                    }
                }
                var capped = Math.min(total, 16);
                if (!skyforge_q3_check_logged) {
                    console.info('[Skyforge] Q3 check firing — found ' + total + ' logs');
                    skyforge_q3_check_logged = true;
                }
                if (task.progress !== capped) {
                    task.setProgress(capped);
                }
            } catch (e) {
                console.error('[Skyforge] Q3 log check failed: ' + e);
            }
        });
        console.info('[Skyforge] Q3 customTask registered (16 logs, any wood)');
    } catch (e) {
        console.error('[Skyforge] Q3 customTask registration failed: ' + e);
    }
});
