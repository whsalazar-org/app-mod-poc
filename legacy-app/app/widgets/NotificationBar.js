/**
 * app/widgets/NotificationBar.js — System notification/alert bar widget.
 *
 * Subscribes to dojo/topic for system alerts and displays dismissible messages.
 *
 * LEGACY: dojo/topic pub/sub instead of Angular service with RxJS Subject.
 * TODO: Replace with Angular Material MatSnackBar or a dedicated notification service.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./NotificationBar.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin"
], function (
    declare, lang, domStyle, domClass, domConstruct, on, topic, template,
    _WidgetBase, _TemplatedMixin
) {
    "use strict";

    var LEVEL_STYLES = {
        info:    { background: "#e3f2fd", border: "#90caf9", color: "#0d47a1", icon: "ℹ" },
        success: { background: "#e8f5e9", border: "#a5d6a7", color: "#1b5e20", icon: "✓" },
        warning: { background: "#fff8e1", border: "#ffe082", color: "#e65100", icon: "⚠" },
        error:   { background: "#ffebee", border: "#ef9a9a", color: "#b71c1c", icon: "✗" }
    };

    return declare("app.widgets.NotificationBar", [_WidgetBase, _TemplatedMixin], {

        templateString: template,

        // Active notification timeout handle.
        _hideHandle: null,

        // Topic subscription handles.
        _subscriptions: null,

        postCreate: function () {
            this.inherited(arguments);
            this._subscriptions = [];
            this._setupSubscriptions();
            domStyle.set(this.domNode, "display", "none");
        },

        startup: function () {
            this.inherited(arguments);
        },

        /**
         * Subscribe to system notification topics.
         * LEGACY: Magic string topic names.
         * TODO: Inject NotificationService and subscribe to notifications$ Observable.
         */
        _setupSubscriptions: function () {
            this._subscriptions.push(
                topic.subscribe("callcenter/notification", lang.hitch(this, function (payload) {
                    this.showMessage(payload.message, payload.level || "info");
                }))
            );

            this._subscriptions.push(
                topic.subscribe("callcenter/error", lang.hitch(this, function (payload) {
                    this.showMessage(payload.message || "An error occurred.", "error");
                }))
            );
        },

        /**
         * Show a notification message.
         *
         * @param {string} message
         * @param {string} level - "info" | "success" | "warning" | "error"
         * @param {number} [duration] - Auto-hide after N ms. Default 5000. Pass 0 to persist.
         */
        showMessage: function (message, level, duration) {
            level = level || "info";
            var styles = LEVEL_STYLES[level] || LEVEL_STYLES.info;

            // Clear any pending auto-hide.
            if (this._hideHandle) {
                clearTimeout(this._hideHandle);
                this._hideHandle = null;
            }

            // Apply styles.
            domStyle.set(this.domNode, {
                display:    "block",
                background: styles.background,
                border:     "1px solid " + styles.border,
                color:      styles.color
            });

            if (this.messageIconNode) {
                this.messageIconNode.innerHTML = styles.icon;
            }
            if (this.messageTextNode) {
                this.messageTextNode.innerHTML = message;
            }

            // Auto-hide after duration (default 5s).
            var autoDuration = (duration !== undefined) ? duration : 5000;
            if (autoDuration > 0) {
                var self = this;
                this._hideHandle = setTimeout(function () {
                    self.hideMessage();
                }, autoDuration);
            }
        },

        /**
         * Dismiss the notification bar.
         */
        hideMessage: function () {
            domStyle.set(this.domNode, "display", "none");
            if (this.messageTextNode) {
                this.messageTextNode.innerHTML = "";
            }
            if (this._hideHandle) {
                clearTimeout(this._hideHandle);
                this._hideHandle = null;
            }
        },

        destroy: function () {
            if (this._hideHandle) {
                clearTimeout(this._hideHandle);
            }
            if (this._subscriptions) {
                this._subscriptions.forEach(function (h) { h.remove(); });
            }
            this.inherited(arguments);
        }
    });
});
