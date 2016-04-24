window.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
        case "J".charCodeAt(0):
            window.scrollBy(0, 100);
            break;
        case "K".charCodeAt(0):
            window.scrollBy(0, -100);
            break;
        case "H".charCodeAt(0):
            if (event.shiftKey) {
                console.log("Sending message");
                safari.self.tab.dispatchMessage("prevTab", "test");
            }
    	}
});

