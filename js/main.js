var hintTexts = [];
var linkHints = [];
var hintMode = false;
var goMode = false;
var insertMode = false;

var codes = {};
for (var c = "A".charCodeAt(0); c < "Z".charCodeAt(0); c++) {
    codes[String.fromCharCode(c)] = c;
    codes[String.fromCharCode(c).toLowerCase()] = c;
}
codes["ESC"] = 27;

for (var c = codes["A"]; c < codes["Z"]; c++) {
    for (var c2 = codes["A"]; c2 < codes["Z"]; c2++) {
        hintTexts.push(String.fromCharCode(c) + String.fromCharCode(c2));
    }
}

var handleScroll = function(event) {
    if (hintMode) {
        removeHints();
    }
}

var handleKeyPress = function(event) {
    if ((insertMode && event.keyCode !== codes["ESC"]) ||
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.getAttribute("contentEditable") === "true") {
        return;
    }
    if (hintMode) {
        handleHintEvent(event);
    } else if (goMode) {
        handleGoEvent(event);
    } else {
    switch (event.keyCode) {
        case codes["J"]:
            if (event.shiftKey) {
                window.history.back();
            } else {
                window.scrollBy(0, 100);
            }
            break;
        case codes["K"]:
            if (event.shiftKey) {
                window.history.forward();
            } else {
                window.scrollBy(0, -100);
            }
            break;
        case codes["L"]:
            if (event.shiftKey) {
                safari.self.tab.dispatchMessage("nextTab", "test");
            }
            break;
        case codes["H"]:
            if (event.shiftKey) {
                safari.self.tab.dispatchMessage("prevTab", "test");
            }
            break;
        case codes["T"]:
            safari.self.tab.dispatchMessage("newTab", "test");
            break;
        case codes["X"]:
            safari.self.tab.dispatchMessage("closeTab", "test");
            break;
        case codes["R"]:
            document.location.reload(true);
            break;
        case codes["F"]:
            if (!event.shiftKey && !event.metaKey) {
                showLinkHints();
            }
            break;
        case codes["G"]:
            if (event.shiftKey) {
                var maxScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
                window.scrollTo(0, maxScroll)
            } else {
                goMode = true;
            }
            break;
        case codes["I"]:
            insertMode = true;
            break;
        case codes["ESC"]:
            insertMode = false;
            break;
        }
    }
    return false;
}

function handleGoEvent(event) {
    switch (event.keyCode) {
        case codes["G"]:
            window.scrollTo(0,0);
            goMode = false;
            break;
        default:
            goMode = false;
            break;
    }
}

function handleHintEvent(event) {
    if (event.keyCode === codes["ESC"]) {
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
    var hintContainer = document.createElement("div");
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

        var top = "" + Math.round(rect.top) + "px";
        var left = "" + Math.round(rect.left) + "px";
        var style = "position: fixed; top: " + top + "; left: " + left + "; ";
        style += "z-index: 1000; color: black; background: yellow";
        hintNode.setAttribute("style", style);

        hintNode.className = "vimple-hintNode";
        hintContainer.appendChild(hintNode);
        linkHints.push(hint);
    }
    document.body.appendChild(hintContainer);
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
        return el.hasAttribute("href") && isVisible(el);
    });
    return links;
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
