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

const LOGS_INGREDIENT = Ingredient.of('#minecraft:logs');

// ---- Q03 (Act I, "First Light"): 16 logs of any wood type ----
FTBQuestsEvents.customTask('5A11E0F101020003', event => {
    try {
        event.setMaxProgress(16);
        event.setCheckTimer(40); // 2 s polling
        event.setEnableButton(true); // manual complete button as a safety net
        event.setCheck((task, player) => {
            try {
                let total = 0;
                const inv = player.inventory;
                const size = inv.containerSize;
                for (let i = 0; i < size; i++) {
                    const stack = inv.getItem(i);
                    if (stack && !stack.isEmpty() && LOGS_INGREDIENT.test(stack)) {
                        total += stack.count;
                    }
                }
                const capped = Math.min(total, 16);
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
