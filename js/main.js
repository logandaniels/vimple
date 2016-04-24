var handleKeyPress = function(event) {
        switch (event.keyCode) {
            case "J".charCodeAt(0):
                if (event.shiftKey) {
                    window.history.back();
                } else {
                    window.scrollBy(0, 100);
                }
                break;
            case "K".charCodeAt(0):
                if (event.shiftKey) {
                    window.history.forward();
                } else {
                    window.scrollBy(0, -100);
                }
                break;
            case "L".charCodeAt(0):
                if (event.shiftKey) {
                    safari.self.tab.dispatchMessage("nextTab", "test");
                }
                break;
            case "H".charCodeAt(0):
                if (event.shiftKey) {
                    safari.self.tab.dispatchMessage("prevTab", "test");
                }
                break;
            case "T".charCodeAt(0):
                safari.self.tab.dispatchMessage("newTab", "test");
                break;
            case "X".charCodeAt(0):
                safari.self.tab.dispatchMessage("closeTab", "test");
                break;
            case "R".charCodeAt(0):
                document.location.reload(true);
                break;
            }
        return false;
}

if (!document["hidden"]) {
    document.addEventListener("keydown", handleKeyPress);
}

/* Slight delay before re-enabling keypress listeners when switching
 * into a tab, to avoid repeated keypresses when switching tabs
 */
document.addEventListener("visibilitychange", function(event) {
    if (!document["hidden"]) {
        setTimeout(function() {
            document.addEventListener("keydown", handleKeyPress);
        }, 50);
    } else {
        document.removeEventListener("keydown", handleKeyPress);
    }
});
