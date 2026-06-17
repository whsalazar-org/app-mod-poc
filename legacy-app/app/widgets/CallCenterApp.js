/**
 * app/widgets/CallCenterApp.js — Root application widget.
 *
 * LEGACY: declare() with _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin.
 * TODO: Replace with Angular root AppComponent using @Component decorator.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/text!./CallCenterApp.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "app/widgets/AgentPanel",
    "app/widgets/CallQueue",
    "app/widgets/ActiveCall",
    "app/widgets/CustomerSearch",
    "app/widgets/CallHistory",
    "app/widgets/NotificationBar",
    "app/store/QueueStore",
    "app/store/AgentStore",
    "app/config"
], function (
    declare, lang, topic, template,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    AgentPanel, CallQueue, ActiveCall, CustomerSearch, CallHistory, NotificationBar,
    QueueStore, AgentStore, config
) {
    "use strict";

    return declare("app.widgets.CallCenterApp",
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        // Template loaded via dojo/text! plugin.
        templateString: template,

        // Widget properties.
        agentId: null,
        config:  null,

        // Child widget instances (set in postCreate).
        _agentPanel:      null,
        _callQueue:        null,
        _activeCall:       null,
        _customerSearch:   null,
        _callHistory:      null,
        _notificationBar:  null,

        // Topic subscription handles for cleanup.
        _subscriptions: null,

        // Queue polling interval handle.
        _pollHandle: null,

        /**
         * postCreate — DOM is ready; instantiate and wire up child widgets.
         * LEGACY: Manual child widget instantiation and event wiring.
         * TODO: In Angular, child components are declared in template and
         *       communicate via @Input/@Output or services.
         */
        postCreate: function () {
            this.inherited(arguments);
            this._subscriptions = [];
            this._initChildWidgets();
            this._setupSubscriptions();
        },

        /**
         * startup — Called after widget is placed in DOM.
         * LEGACY: Two-phase construction (postCreate + startup).
         * TODO: Angular components have ngOnInit() as a single init hook.
         */
        startup: function () {
            this.inherited(arguments);

            // Start all child widgets.
            if (this._agentPanel)     { this._agentPanel.startup(); }
            if (this._callQueue)      { this._callQueue.startup(); }
            if (this._activeCall)     { this._activeCall.startup(); }
            if (this._customerSearch) { this._customerSearch.startup(); }
            if (this._callHistory)    { this._callHistory.startup(); }
            if (this._notificationBar){ this._notificationBar.startup(); }

            // Begin queue polling.
            this._startQueuePolling();

            console.log("[CallCenterApp] startup complete.");
        },

        /**
         * Instantiate child widgets and place them in attach points.
         */
        _initChildWidgets: function () {
            var agent = AgentStore.get(this.agentId) || {};

            this._notificationBar = new NotificationBar(
                {}, this.notificationBarNode);

            this._agentPanel = new AgentPanel({
                agentId:    this.agentId,
                agentName:  (agent.firstName || "") + " " + (agent.lastName || ""),
                extension:  agent.extension || "",
                status:     agent.status    || "available"
            }, this.agentPanelNode);

            this._callQueue = new CallQueue({
                store:   QueueStore,
                agentId: this.agentId
            }, this.callQueueNode);

            this._activeCall = new ActiveCall({
                agentId: this.agentId
            }, this.activeCallNode);

            this._customerSearch = new CustomerSearch({}, this.customerSearchNode);

            this._callHistory = new CallHistory({}, this.callHistoryNode);
        },

        /**
         * Set up dojo/topic subscriptions for inter-widget communication.
         * LEGACY: pub/sub via dojo/topic — magic string topics.
         * TODO: Replace with Angular services using RxJS Subjects.
         */
        _setupSubscriptions: function () {
            var self = this;

            // When a call is answered in the queue, show it in ActiveCall panel.
            this._subscriptions.push(
                topic.subscribe("callcenter/call/answered", function (payload) {
                    self._activeCall.loadCall(payload.call);
                    self._onCallAnswered(payload.call);
                })
            );

            // When a call ends, clear the ActiveCall panel.
            this._subscriptions.push(
                topic.subscribe("callcenter/call/ended", function (payload) {
                    self._activeCall.clearCall();
                    // Reload call history if we have a customer selected.
                    if (payload.customerId) {
                        self._callHistory.loadHistory(payload.customerId);
                    }
                })
            );

            // When a customer is selected in search, load their call history.
            this._subscriptions.push(
                topic.subscribe("callcenter/customer/selected", function (payload) {
                    self._callHistory.loadHistory(payload.customerId);
                    self._activeCall.setCustomer(payload.customer);
                })
            );

            // System notifications.
            this._subscriptions.push(
                topic.subscribe("callcenter/notification", function (payload) {
                    self._notificationBar.showMessage(payload.message, payload.level);
                })
            );
        },

        /**
         * Called when the agent answers a queued call.
         */
        _onCallAnswered: function (call) {
            AgentStore.updateStatus(this.agentId, "busy");
            this._agentPanel.setStatus("busy");
            QueueStore.removeCall(call.callId);
        },

        /**
         * Start polling the queue store for updates.
         * LEGACY: setInterval-based polling — crude and imprecise.
         * TODO: Replace with WebSocket or SSE subscription (RxJS fromEvent / webSocket).
         */
        _startQueuePolling: function () {
            var self = this;
            this._pollHandle = setInterval(function () {
                self._callQueue.refresh();
            }, config.queuePollInterval || 5000);
        },

        /**
         * destroy — Clean up subscriptions and timers.
         * LEGACY: Manual cleanup required in Dojo.
         * TODO: Angular handles cleanup via ngOnDestroy() + takeUntilDestroyed().
         */
        destroy: function () {
            // Clear polling interval.
            if (this._pollHandle) {
                clearInterval(this._pollHandle);
                this._pollHandle = null;
            }

            // Unsubscribe from all topics.
            if (this._subscriptions) {
                this._subscriptions.forEach(function (handle) {
                    handle.remove();
                });
                this._subscriptions = [];
            }

            this.inherited(arguments);
        }
    });
});
