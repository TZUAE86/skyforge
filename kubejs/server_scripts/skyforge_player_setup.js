// Skyforge — first-login player setup.
//
// On a player's first login to the world, give them a Quest Book and
// a friendly Charter greeting. Tracked via player.persistentData so
// subsequent logins don't re-issue the book or spam the message.
//
// Rhino-safe: classic function() + var; no arrow bodies, no const/let
// inside the handler.

PlayerEvents.loggedIn(function(event) {
    try {
        var player = event.player;
        var pd = player.persistentData;
        if (pd.getBoolean('skyforge_first_login_done')) return;

        try {
            player.give(Item.of('ftbquests:book'));
        } catch (e) {
            console.error('[Skyforge] book give failed: ' + e);
        }

        try {
            player.tell('§6=== Skyforge Charter ===');
            player.tell('§e[Charter] §fForeman. A Quest Book has been issued to your inventory.');
            player.tell('§7Right-click to open. Type §f/skyforge lore§7 at any time to read your log.');
        } catch (e) {
            console.error('[Skyforge] welcome tell failed: ' + e);
        }

        pd.putBoolean('skyforge_first_login_done', true);
    } catch (e) {
        console.error('[Skyforge] first-login setup failed: ' + e);
    }
});

console.info('[Skyforge] first-login player setup armed');
