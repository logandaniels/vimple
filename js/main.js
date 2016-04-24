var handleScroll = function(event) {
    removeHints();
}

var handleKeyPress = function(event) {
    if (document.activeElement.tagName === "INPUT") {
        return;
    }
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
            case "F".charCodeAt(0):
                showLinkHints();
                break;
            case 27: // ESCAPE
                removeHints();
                break;
            }
        return false;
}

function showLinkHints() {
    var visibleLinks = getVisibleLinks();
    for (var i = 0; i < visibleLinks.length; i++) {
        var link = visibleLinks[i];
        var rect = link.getBoundingClientRect();
        var hint = document.createElement("div");
        hint.textContent = "test";
        hint.style.position = "fixed";
        hint.style.top = "" + Math.round(rect.top) + "px";
        hint.style.left = "" + Math.round(rect.left) + "px";
        hint.style["z-index"] = "1000";
        hint.style.color = "black";
        hint.style.background = "yellow"
        hint.className = "vimple-hint";
        document.body.appendChild(hint);
    }
    
}

function removeHints() {
    var hints = document.getElementsByClassName("vimple-hint");
    while (hints[0]) {
        var hint = hints[0];
        hint.parentNode.removeChild(hint);
    }
}

function getVisibleLinks() {
    var a = document.getElementsByTagName("a");
    var links = Array.prototype.filter.call(a, function(el) {
        return el.hasAttribute("href");
    });
    return Array.prototype.filter.call(links, isVisible);
}

function isVisible(elem) {
    var rect = elem.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    if ((rect.top === 0 && rect.bottom === 0 && rect.left === 0 && rect.right === 0) ||
        (rect.bottom < 0 || rect.top - viewHeight >= 0)) {
       return false;
    }

    return isHidden(elem);
}

function isHidden(elem) {
    if  (window.getComputedStyle(elem).visibility === "hidden" ||
         window.getComputedStyle(elem).display === "none" ||
         elem.getAttribute("aria-hidden") === "true") {
        return false;
    }
    if (elem.parentNode.style) {
        return isHidden(elem.parentNode);
    } else {
        return true;
    }
}

if (!document["hidden"]) {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("scroll", handleScroll);
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
