// Skyforge — FTB Quests custom-task handlers.
//
// FTB Quests' built-in "item" task cannot match item tags (e.g.
// #minecraft:logs) without the Item Filters mod, which has no 1.21.1
// NeoForge port. The workaround is a CustomTask whose check is
// registered from KubeJS — fires every checkTimer ticks for each
// player and updates progress.
//
// Event ID format: ftbquests.custom_task.<lowercase-hex-of-task-id>
// Task IDs come from the chapter .snbt files.

// ---- Q03 (Act I, "First Light"): 16 logs of any wood type ----
const LOG_TAG_INGREDIENT = Ingredient.of('#minecraft:logs');

FTBQuestsEvents.customTask('5a11e0f101020003', event => {
    try {
        event.maxProgress = 16;
        event.checkTimer = 40; // 2s polling
        event.check = (task, player) => {
            try {
                let total = 0;
                const inv = player.inventory;
                const size = inv.containerSize;
                for (let i = 0; i < size; i++) {
                    const stack = inv.getItem(i);
                    if (stack && !stack.isEmpty() && LOG_TAG_INGREDIENT.test(stack)) {
                        total += stack.count;
                    }
                }
                const capped = Math.min(total, 16);
                if (task.progress !== capped) {
                    task.progress = capped;
                }
            } catch (e) {
                console.error('[Skyforge] Q3 log check failed: ' + e);
            }
        };
    } catch (e) {
        console.error('[Skyforge] Q3 customTask registration failed: ' + e);
    }
});
