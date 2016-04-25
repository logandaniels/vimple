var hintTexts = [];
var linkHints = [];
var hintMode = false;

for (var c = "A".charCodeAt(0); c < "Z".charCodeAt(0); c++) {
    for (var c2 = "A".charCodeAt(0); c2 < "Z".charCodeAt(0); c2++) {
        hintTexts.push(String.fromCharCode(c) + String.fromCharCode(c2));
    }
}

var handleScroll = function(event) {
    if (hintMode) {
        removeHints();
    }
}

var handleKeyPress = function(event) {
    if (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.getAttribute("contentEditable") === "true") {
        return;
    }
    if (hintMode) {
        handleHintEvent(event);
    } else {
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
            if (!event.shiftKey && !event.metaKey) {
                showLinkHints();
            }
            break;
        case 27: // ESCAPE
            break;
        }
    }
    return false;
}

function handleHintEvent(event) {
    if (event.keyCode === 27) { // ESCAPE
        removeHints();
        hintMode = false;
        return;
    }
    var pressed = String.fromCharCode(event.keyCode);
    var i = 0;
    while (linkHints[i]) {
        var hint = linkHints[i];
        if (hint.hintText[hint.typedIndex] !== pressed) {
            hint.node.parentNode.removeChild(hint.node);
            linkHints.splice(i,1);
        } else {
            hint.typedIndex++;
            updateHintText(hint);
            i++;
        }
    }
    if (linkHints.length == 1) {
        window.location.href = linkHints[0].url;
    } else if (linkHints.length == 0) {
        removeHints();
    }
}

function updateHintText(hint) {
    hint.node.innerHTML = "<span style=\"color: grey\">" + hint.hintText.slice(0,hint.typedIndex) + "</span>"+ "<b>" + hint.hintText.slice(hint.typedIndex, hint.hintText.length) + "</b>";
}


function showLinkHints() {
    hintMode = true;
    var visibleLinks = getVisibleLinks();
    for (var i = 0; i < visibleLinks.length && i < hintTexts.length; i++) {
        var link = visibleLinks[i];
        var rect = link.getBoundingClientRect();
        var hint = {};
        var hintNode = document.createElement("div");
        hint.url = link.getAttribute("href");
        hint.hintText = hintTexts[i];
        hint.typedIndex = 0;
        hint.node = hintNode;
        updateHintText(hint);
        hintNode.style.position = "fixed";
        hintNode.style.top = "" + Math.round(rect.top) + "px";
        hintNode.style.left = "" + Math.round(rect.left) + "px";
        hintNode.style["z-index"] = "1000";
        hintNode.style.color = "black";
        hintNode.style.background = "yellow"
        hintNode.className = "vimple-hintNode";
        document.body.appendChild(hintNode);
        linkHints.push(hint);
    }
}

function removeHints() {
    while (linkHints[0]) {
        var hint = linkHints[0];
        hint.node.parentNode.removeChild(hint.node);
        linkHints.splice(0,1);
    }
    hintMode = false;
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
