/**
 * app/widgets/AgentPanel.js — Agent status and availability widget.
 *
 * LEGACY: dijit _WidgetBase + _TemplatedMixin widget.
 * TODO: Replace with Angular AgentPanelComponent using Angular Material Card.
 *
 * KNOWN ISSUES:
 *   - LEGACY: Missing destroy() override — subscription handles are not cleaned up.
 *     TODO: Add destroy() that calls handle.remove() on all subscriptions.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/topic",
    "dojo/on",
    "dojo/text!./AgentPanel.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/form/Select",
    "app/store/AgentStore",
    "app/config"
], function (
    declare, lang, domStyle, domClass, topic, on, template,
    _WidgetBase, _TemplatedMixin,
    Select, AgentStore, config
) {
    "use strict";

    return declare("app.widgets.AgentPanel", [_WidgetBase, _TemplatedMixin], {

        templateString: template,

        // Widget properties.
        agentId:   "",
        agentName: "",
        extension: "",
        status:    "available",

        // Statistics (updated from server).
        callsHandled:  0,
        avgHandleTime: 0,

        // Dijit Select widget for status dropdown (attach point in template).
        _statusSelect: null,

        // Topic subscription handle.
        // LEGACY: Stored but never removed in destroy() — memory leak.
        _statusHandle: null,

        postCreate: function () {
            this.inherited(arguments);
            this._initStatusSelect();
            this._updateStatusIndicator(this.status);

            // Display agent name.
            if (this.agentNameNode) {
                this.agentNameNode.innerHTML = this.agentName || "Unknown Agent";
            }
            if (this.extensionNode) {
                this.extensionNode.innerHTML = "Ext. " + (this.extension || "—");
            }

            // Subscribe to status changes from other parts of the app.
            // LEGACY: Magic string topic — see config.topics for the constant.
            // LEGACY: Handle stored but destroy() is missing — leak!
            this._statusHandle = topic.subscribe(
                "callcenter/agent/statusChanged",
                lang.hitch(this, "_onExternalStatusChange")
            );
        },

        startup: function () {
            this.inherited(arguments);
            this._loadStats();
        },

        /**
         * Initialise the status dropdown Select widget.
         * LEGACY: Programmatic Dijit widget creation inside postCreate.
         * TODO: In Angular, use <mat-select> bound via [(ngModel)] or FormControl.
         */
        _initStatusSelect: function () {
            var self = this;
            var options = config.agentStatuses.map(function (s) {
                return { value: s.value, label: s.label, selected: s.value === self.status };
            });

            this._statusSelect = new Select({
                options: options,
                style: "width:140px;"
            }, this.statusSelectNode);

            // LEGACY: dojo/on instead of deprecated dojo.connect.
            // Old style (do NOT use): dojo.connect(this._statusSelect, "onChange", ...)
            this.own(
                on(this._statusSelect, "change", lang.hitch(this, "_onStatusChange"))
            );
        },

        /**
         * Handle agent changing their own status via the dropdown.
         */
        _onStatusChange: function (newStatus) {
            AgentStore.updateStatus(this.agentId, newStatus);
            this._updateStatusIndicator(newStatus);
            this.status = newStatus;

            // Notify rest of app.
            topic.publish("callcenter/agent/statusChanged", {
                agentId: this.agentId,
                status:  newStatus
            });
        },

        /**
         * Handle status change published by another widget (e.g., CallCenterApp).
         */
        _onExternalStatusChange: function (payload) {
            if (payload.agentId !== this.agentId) { return; }
            this.setStatus(payload.status);
        },

        /**
         * Programmatically set the displayed status.
         * @param {string} newStatus
         */
        setStatus: function (newStatus) {
            this.status = newStatus;
            if (this._statusSelect) {
                this._statusSelect.set("value", newStatus);
            }
            this._updateStatusIndicator(newStatus);
        },

        /**
         * Update the coloured status dot in the UI.
         */
        _updateStatusIndicator: function (status) {
            if (!this.statusIndicatorNode) { return; }
            var colorMap = {
                available:   "#4caf50",
                busy:        "#f44336",
                break:       "#ff9800",
                training:    "#2196f3",
                unavailable: "#9e9e9e"
            };
            var color = colorMap[status] || "#9e9e9e";
            domStyle.set(this.statusIndicatorNode, "backgroundColor", color);
            this.statusIndicatorNode.title = status;
        },

        /**
         * Load agent statistics from the AgentStore.
         * LEGACY: Synchronous in-memory read — no async HTTP call.
         */
        _loadStats: function () {
            var agent = AgentStore.get(this.agentId);
            if (!agent) { return; }
            this.callsHandled  = agent.callsHandled  || 0;
            this.avgHandleTime = agent.avgHandleTime || 0;
            if (this.callsHandledNode) {
                this.callsHandledNode.innerHTML = this.callsHandled;
            }
            if (this.avgHandleTimeNode) {
                this.avgHandleTimeNode.innerHTML = this.avgHandleTime + "s";
            }
        }

        // LEGACY: destroy() override is missing!
        // TODO: Add:
        //   destroy: function () {
        //       if (this._statusHandle) { this._statusHandle.remove(); }
        //       this.inherited(arguments);
        //   }
    });
});
