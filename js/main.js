var hintTexts = [];
var linkHints = [];
var hintMode = false;
var hintModeNewTab = false;
var goMode = false;
var insertMode = false;
var statusBarEnabled = true;
var disabled = false;


var codes = {};
for (var c = "A".charCodeAt(0); c <= "Z".charCodeAt(0); c++) {
    codes[c] = String.fromCharCode(c);
}
codes[27] = "ESC";
codes[191] = "/";

for (var c = "A".charCodeAt(0); c <= "Z".charCodeAt(0); c++) {
    for (var c2 = "A".charCodeAt(0); c2 <= "Z".charCodeAt(0); c2++) {
        hintTexts.push(String.fromCharCode(c) + String.fromCharCode(c2));
    }
}

function openSettings() {
    safari.self.tab.dispatchMessage("newTab", safari.extension.baseURI + "settings.html");
}

function handleEscape() {
    hideStatusBar();
    insertMode = false;
}

function scrollDown() {
    window.scrollBy(0, 100);
}
function scrollUp() {
    window.scrollBy(0, -100);
}
function prevTab() {
    safari.self.tab.dispatchMessage("prevTab");
}
function nextTab() {
    safari.self.tab.dispatchMessage("nextTab");
}
function historyBack() {
    window.history.back();
}
function historyForward() {
    window.history.forward();
}
function newTab() {
    safari.self.tab.dispatchMessage("newTab");
}
function closeTab() {
    safari.self.tab.dispatchMessage("closeTab");
}
function reload() {
    document.location.reload(true);
}
function scrollToBottom() {
    var maxScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
       document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
    window.scrollTo(0, maxScroll)
}
function activateInsertMode() {
    showStatusBar("Insert mode");
    insertMode = true;
}
function activateGoMode() {
    showStatusBar("Go to...");
    goMode = true;
}

var handleKeyPress = function(event) {
    var key = codes[event.keyCode];
    if (!key) {
      return;
    }
    if (disabled ||
        event.metaKey ||
        (insertMode && key !== "ESC") ||
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
        if (event.keyCode >= "A".charCodeAt(0) && event.keyCode <= "Z".charCodeAt(0)) {
            if (!event.shiftKey) {
                key = key.toLowerCase();
            }
            if (shortcuts.hasOwnProperty(key)) {
                shortcuts[key]();
            }
        } else {
            switch (key) {
                case "ESC":
                    shortcuts[key]();
                    break;
                case "/":
                    if (event.shiftKey) {
                      shortcuts["?"]();
                    } else {
                      shortcuts["/"]();
                    }
                    break;
                default:
                  break;
            }
        }
    }
    return false;
}

function handleGoEvent(event) {
    var key = codes[event.keyCode];
    switch (key) {
        case "G":
            window.scrollTo(0,0);
            goMode = false;
            hideStatusBar();
            break;
        default:
            goMode = false;
            hideStatusBar();
            break;
    }
}

function handleHintEvent(event) {
    if (codes[event.keyCode] === "ESC") {
        endHintMode();
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
        // Check if http in url so we don't try to open an anchor with href="#top" in a new tab
        if (hintModeNewTab && linkHints[0].url.indexOf("http") > -1) {
            safari.self.tab.dispatchMessage("newTab", linkHints[0].url);
        } else {
            window.location.href = linkHints[0].url;
        }
        endHintMode();
    } else if (linkHints.length == 0) {
        endHintMode();
    }
}

function updateHintText(hint) {
    hint.node.innerHTML = "<span style=\"color: grey\">" + hint.hintText.slice(0,hint.typedIndex) + "</span>"+ "<b>" + hint.hintText.slice(hint.typedIndex, hint.hintText.length) + "</b>";
}

function openLink() {
    hintMode = true;
    showLinkHints();
}

function openLinkInNewTab() {
    hintMode = true;
    hintModeNewTab = true;
    showLinkHints();
}

function showLinkHints() {
    showStatusBar("Open link in current tab");
    hintMode = true;
    var visibleLinks = getVisibleLinks();
    var hintContainer = document.getElementById("vimple-hintcontainer");
    if (!hintContainer) {
        hintContainer = document.createElement("div");
        hintContainer.setAttribute("id", "vimple-hintcontainer");
    }
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

function endHintMode() {
    while (linkHints[0]) {
        var hint = linkHints[0];
        hint.node.parentNode.removeChild(hint.node);
        linkHints.splice(0,1);
    }
    hintMode = false;
    hintModeNewTab = false;
    hideStatusBar();
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

    return !isHidden(elem);
}

function isHidden(elem) {
    if  (window.getComputedStyle(elem).visibility === "hidden" ||
         window.getComputedStyle(elem).display === "none" ||
         elem.getAttribute("aria-hidden") === "true") {
        return true;
    }
    
    // Check if of its ancestors is hidden
    if (elem.parentNode.style) {
        return isHidden(elem.parentNode);
    } else {
        return false;
    }
}

function showStatusBar(text) {
    if (!statusBarEnabled) {
        return;
    }
    var bar = document.getElementById("vimple-statusbar");
    if (!bar) {
        // Create the bar
        bar = document.createElement("div");
        document.body.appendChild(bar);        
        bar.setAttribute("id", "vimple-statusbar");
        bar.setAttribute("style", "position: fixed; bottom: 0px; right: 50px; padding-left: 1em; padding-right: 1em; background: lightgray; color: black; border: 1px solid gray");
    }
    bar.style.display = "";
    bar.innerText = text;
}

function hideStatusBar(text) {
    var bar = document.getElementById("vimple-statusbar");
    if (bar) {
        bar.style.display = "none";
    }
}

var shortcuts = {};

var keyBindingsToFunctions = {
    "scrollDown" : scrollDown,
    "scrollUp" : scrollUp,
    "historyBack" : historyBack,
    "historyForward" : historyForward,
    "prevTab" : prevTab,
    "nextTab" : nextTab,
    "newTab" : newTab,
    "closeTab" : closeTab,
    "scrollToBottom" : scrollToBottom,
    "activateGoMode" : activateGoMode,
//    "gg" : scrollToTop,
    "openLink" : openLink,
    "openLinkInNewTab" : openLinkInNewTab,
    "activateInsertMode" : activateInsertMode,
    "handleEscape" : handleEscape,
    "openSettings" : openSettings
}

function updateSettings(settings) {
  console.log("Got settings");
  console.log(settings);
  shortcuts = {};
  for (var shortcutName in keyBindingsToFunctions) {
    shortcuts[settings[shortcutName]] = keyBindingsToFunctions[shortcutName];
  }

  disabled = false;
  for (var i = 0; i < settings["blacklist"].length; i++) {
    var blacklistedURL = settings["blacklist"][i];
    if (window.location.host.indexOf(blacklistedURL) > -1) {
        console.log("Disabling on current url due to blacklist on " + blacklistedURL);
        disabled = true;
        break;
    }
  }
}


safari.self.addEventListener("message", function(event) {
    switch (event.name) {
      case "getSettings":
        updateSettings(event.message);
        break;
    }
}, false);

var handleScroll = function(event) {
    if (hintMode) {
        endHintMode();
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

safari.self.tab.dispatchMessage("getSettings");
