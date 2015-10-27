const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');

var nativeWindow;
var browserApp;
var menuId;
var lastURI;

function rememberURI(event) {
  let browser = event.target;
  lastURI = browser.currentURI.spec;
}

function reopenTab() {
	alert('ccc');
  if (lastURI)
    browserApp.addTab('http://www.baidu.com');
}

function loadIntoWindow(window) {
  if (!window)
    return;
  nativeWindow = window.NativeWindow;
  browserApp = window.BrowserApp;
  menuId = window.NativeWindow.menu.add("Reopen Tab", null, reopenTab);
  browserApp.deck.addEventListener("TabClose", rememberURI, false);
}

function unloadFromWindow(window) {
  if (!window)
    return;
	nativeWindow.menu.remove(menuId);
  browserApp.deck.removeEventListener("TabClose", rememberURI, false);
  // Remove any persistent UI elements
  // Perform any other cleanup
}

var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function onLoad() {
      domWindow.removeEventListener("UIReady", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },
 
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
