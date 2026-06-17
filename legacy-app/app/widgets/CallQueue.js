/**
 * app/widgets/CallQueue.js — Live incoming call queue widget.
 *
 * LEGACY: Dijit widget using dojo/dom-construct for row rendering.
 * TODO: Replace with Angular CallQueueComponent using *ngFor and Angular CDK.
 *
 * KNOWN ISSUES:
 *   1. LEGACY: setInterval without proper cleanup (not using this.own()).
 *      The interval is stored in this._pollHandle but destroy() may not always
 *      be called, causing leaks. The interval also polls even when no calls change.
 *      TODO: Use WebSocket/SSE + RxJS interval() with takeUntilDestroyed().
 *
 *   2. LEGACY: dojo/_base/xhr referenced in comments below (deprecated since 1.8).
 *      TODO: Use dojo/request/xhr (already done in actual code) or Angular HttpClient.
 *
 *   3. LEGACY: mixes dijit/_CssStateMixin (adds hover/active CSS class management).
 *      TODO: In Angular, use :hover/:focus CSS pseudo-classes or Angular CDK state.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./CallQueue.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_CssStateMixin",
    "app/store/QueueStore",
    "app/utils/formatters"
], function (
    declare, lang, dom, domConstruct, domClass, domStyle, on, topic, template,
    _WidgetBase, _TemplatedMixin, _CssStateMixin,
    QueueStore, formatters
) {
    "use strict";

    return declare("app.widgets.CallQueue",
        [_WidgetBase, _TemplatedMixin, _CssStateMixin], {

        templateString: template,
        baseClass: "callQueue",

        // Widget properties.
        agentId: "",
        store:   null,

        // LEGACY: setInterval handle stored but cleanup is fragile.
        _pollHandle: null,

        // Map from callId → DOM row node (for targeted updates).
        _rowNodes: null,

        postCreate: function () {
            this.inherited(arguments);
            this._rowNodes = {};
            this._render();
        },

        startup: function () {
            this.inherited(arguments);
            // LEGACY: setInterval polling instead of Observable or WebSocket.
            // Old comment from original developer:
            //   // dojo.connect(topic, "callcenter/queue/updated", this, "_onQueueUpdate");
            //   // ^ This was the original intent but dojo.connect is deprecated.
            // TODO: Replace with RxJS interval(5000).pipe(switchMap(() => this.queueService.getQueue()))
            this._pollHandle = setInterval(
                lang.hitch(this, "refresh"),
                5000
            );
        },

        /**
         * Refresh the queue display from the store.
         * Called by the polling interval and by CallCenterApp.
         */
        refresh: function () {
            this._render();
        },

        /**
         * Render all queued calls into the table body.
         * LEGACY: Manual DOM construction via dojo/dom-construct.
         * TODO: Replace with Angular template + *ngFor directive.
         */
        _render: function () {
            if (!this.queueBodyNode) { return; }

            // Clear existing rows.
            domConstruct.empty(this.queueBodyNode);
            this._rowNodes = {};

            var calls = QueueStore.getAllQueued();

            if (calls.length === 0) {
                var emptyRow = domConstruct.create("tr", {}, this.queueBodyNode);
                domConstruct.create("td", {
                    colspan: 4,
                    innerHTML: "<em style='color:#999;'>No calls in queue</em>",
                    style: "text-align:center; padding:16px;"
                }, emptyRow);
                this._updateQueueCount(0);
                return;
            }

            var self = this;
            calls.forEach(function (call) {
                self._addRow(call);
            });

            this._updateQueueCount(calls.length);
        },

        /**
         * Create a single table row for a queued call.
         * LEGACY: String concatenation for HTML — XSS risk if data is untrusted.
         * TODO: Use Angular template with proper escaping via interpolation {{ }}.
         */
        _addRow: function (call) {
            var tr = domConstruct.create("tr", {
                "data-call-id": call.callId,
                style: "cursor:pointer;"
            }, this.queueBodyNode);

            // Priority indicator.
            var priorityColor = call.priority === "high" ? "#f44336" : "#4caf50";

            // Caller name cell.
            domConstruct.create("td", {
                innerHTML: '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:' +
                           priorityColor + '; margin-right:6px;"></span>' +
                           (call.callerName || "Unknown"),
                style: "padding:6px 8px; font-size:12px;"
            }, tr);

            // Phone cell — formatted.
            domConstruct.create("td", {
                innerHTML: formatters.formatPhoneNumber(call.callerPhone),
                style: "padding:6px 4px; font-size:11px; color:#666;"
            }, tr);

            // Skill cell.
            domConstruct.create("td", {
                innerHTML: call.skillRequired || "general",
                style: "padding:6px 4px; font-size:11px; color:#888;"
            }, tr);

            // Action buttons cell.
            var actionTd = domConstruct.create("td", {
                style: "padding:4px; white-space:nowrap;"
            }, tr);

            var answerBtn = domConstruct.create("button", {
                innerHTML: "Answer",
                "class":   "cc-btn cc-btn-primary",
                style:     "font-size:11px; padding:2px 6px; margin-right:4px;"
            }, actionTd);

            // LEGACY: dojo/on for event binding (preferred over deprecated dojo.connect).
            // Old style: dojo.connect(answerBtn, "onclick", ...)
            var answerHandle = on(answerBtn, "click", lang.hitch(this, "_onAnswerCall", call));
            this.own(answerHandle);

            this._rowNodes[call.callId] = tr;
        },

        /**
         * Handle "Answer" button click for a queued call.
         * Publishes to dojo/topic so CallCenterApp can wire up the ActiveCall panel.
         *
         * LEGACY: Magic string topic name — should be a constant.
         * TODO: Dispatch NgRx action or call a shared CallStateService method.
         *
         * @param {Object} call
         */
        _onAnswerCall: function (call) {
            console.log("[CallQueue] Answering call:", call.callId);

            // Mark as ringing in the store.
            QueueStore.updateCallStatus(call.callId, "ringing");

            // Publish so ActiveCall panel and CallCenterApp can react.
            topic.publish("callcenter/call/answered", {
                call:    call,
                agentId: this.agentId
            });
        },

        /**
         * Update the queue count badge in the panel header.
         */
        _updateQueueCount: function (count) {
            if (this.queueCountNode) {
                this.queueCountNode.innerHTML = count;
                domStyle.set(this.queueCountNode,
                    "background", count > 0 ? "#f44336" : "#4caf50");
            }
        },

        /**
         * destroy — clean up polling interval.
         * LEGACY: Manual cleanup in Dojo vs. Angular ngOnDestroy() + takeUntilDestroyed().
         */
        destroy: function () {
            if (this._pollHandle) {
                clearInterval(this._pollHandle);
                this._pollHandle = null;
            }
            this.inherited(arguments);
        }
    });
});
