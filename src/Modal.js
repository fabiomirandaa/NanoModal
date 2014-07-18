
var El = require("./El");

function Modal(content, options, overlay, customShow, customHide) {
    if (content === undefined) {
        return;
    }
    options = options || {};
    var modal = El("div", "nanoModal nanoModalOverride " + (options.classes || ""));
    var contentContainer = El("div", "nanoModalContent");
    var buttonArea = El("div", "nanoModalButtons");
    var onRequestHideListenerId;

    modal.add(contentContainer);
    modal.add(buttonArea);
    modal.setStyle("display", "none");

    var buttons = [];

    options.buttons = options.buttons || [{
        text: "Close",
        handler: "hide",
        primary: true
    }];

    var removeButtons = function() {
        var t = buttons.length;
        while (t-- > 0) {
            var button = buttons[t];
            button.remove();
        }
        buttons = [];
    };

    var center = function() {
        modal.setStyle("marginLeft", -modal.el.clientWidth / 2 + "px");
    };

    var anyModalsOpen = function() {
        var modals = document.querySelectorAll(".nanoModal");
        var t = modals.length;
        while (t-- > 0) {
            if (modals[t].style.display !== "none") {
                return true;
            }
        }
        return false;
    };

    var defaultShow = function() {
        if (!modal.isShowing()) {
            // Call the static method from the Modal module.
            Modal.resizeOverlay();
            overlay.show();
            modal.show();
            center();
        }
    };

    var defaultHide = function() {
        if (modal.isShowing()) {
            modal.hide();
            if (!anyModalsOpen()) {
                overlay.hide();
            }
            if (options.autoRemove) {
                pub.remove();
            }
        }
    };

    var pub = {
        modal: modal,
        overlay: overlay,
        content: content,
        options: options,
        show: function() {
            if (customShow) {
                customShow(defaultShow, pub);
            } else {
                defaultShow();
            }
            return pub;
        },
        hide: function() {
            if (customHide) {
                customHide(defaultHide, pub);
            } else {
                defaultHide();
            }
            return pub;
        },
        onShow: function(callback) {
            modal.onShowEvent.addListener(function() {
                callback(pub);
            });
            return pub;
        },
        onHide: function(callback) {
            modal.onHideEvent.addListener(function() {
                callback(pub);
            });
            return pub;
        },
        remove: function() {
            overlay.onRequestHide.removeListener(onRequestHideListenerId);
            onRequestHideListenerId = null;
            removeButtons();
            modal.remove();
        },
        setButtons: function(buttonList) {
            var btnIdx = buttonList.length;
            var btnObj;
            var btnEl;
            var classes;

            removeButtons();

            if (btnIdx === 0) {
                buttonArea.hide();
            } else {
                buttonArea.show();
                while (btnIdx-- > 0) {
                    btnObj = buttonList[btnIdx];
                    classes = "nanoModalBtn";
                    if (btnObj.primary) {
                        classes += " nanoModalBtnPrimary";
                    }
                    btnEl = El("button", classes);
                    if (btnObj.handler === "hide") {
                        btnEl.addClickListener(pub.hide);
                    } else if (btnObj.handler) {
                        btnEl.addClickListener(btnObj.handler);
                    }
                    btnEl.text(btnObj.text);
                    buttonArea.add(btnEl);
                    buttons.push(btnEl);
                }
            }
            center();
            return pub;
        },
        setContent: function(newContent) {
            // Only good way of checking if a node in IE8...
            if (newContent.nodeType) {
                contentContainer.html("");
                contentContainer.add(newContent);
            } else {
                contentContainer.html(newContent);
            }
            center();
            return pub;
        }
    };

    onRequestHideListenerId = overlay.onRequestHide.addListener(function() {
        if (options.overlayClose !== false && modal.isShowing()) {
            pub.hide();
        }
    });

    pub.setContent(content).setButtons(options.buttons);

    document.body.appendChild(modal.el);

    return pub;
}

var doc = document;

var getDocumentDim = function(name) {
    var docE = doc.documentElement;
    var scroll = "scroll" + name;
    var offset = "offset" + name;
    return Math.max(doc.body[scroll], docE[scroll],
        doc.body[offset], docE[offset], docE["client" + name]);
};

// Make this a static function so that main.js has access to it so it can
// add a window keydown event listener. Modal.js also needs this function.
Modal.resizeOverlay = function() {
    var overlay = doc.getElementById("nanoModalOverlay");
    overlay.style.width = getDocumentDim("Width") + "px";
    overlay.style.height = getDocumentDim("Height") + "px";
};

module.exports = Modal;
