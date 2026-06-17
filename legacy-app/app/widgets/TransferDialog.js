/**
 * app/widgets/TransferDialog.js — Call transfer dialog.
 *
 * LEGACY: dijit/Dialog subclass with manual agent list rendering.
 * TODO: Replace with Angular MatDialog + TransferCallDialogComponent.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./TransferDialog.html",
    "dijit/Dialog",
    "dijit/form/Select",
    "dijit/form/Textarea",
    "app/store/AgentStore",
    "app/services/CallService"
], function (
    declare, lang, domConstruct, on, topic, template,
    Dialog, Select, Textarea,
    AgentStore, CallService
) {
    "use strict";

    return declare("app.widgets.TransferDialog", [Dialog], {

        // Override the Dialog templateString with our content.
        content: template,
        title:   "Transfer Call",
        style:   "width: 400px;",

        // The call object being transferred.
        call:    null,
        agentId: null,

        // Dijit form widgets.
        _agentSelect:    null,
        _reasonTextarea: null,

        /**
         * postCreate — wire up form widgets inside the dialog content.
         * LEGACY: Programmatic Dijit widget creation after dialog render.
         * TODO: Use Angular component with template-driven form.
         */
        postCreate: function () {
            this.inherited(arguments);
            this._initAgentList();
            this._initReasonField();
            this._wireButtons();
        },

        _initAgentList: function () {
            var self    = this;
            var agents  = AgentStore.getAvailable();
            var options = agents
                .filter(function (a) { return a.agentId !== self.agentId; })
                .map(function (a) {
                    return {
                        value: a.agentId,
                        label: a.firstName + " " + a.lastName +
                               " (Ext. " + a.extension + ") — " + a.status
                    };
                });

            if (options.length === 0) {
                options = [{ value: "", label: "No agents available" }];
            } else {
                options.unshift({ value: "", label: "— Select Agent —" });
            }

            var agentSelectNode = this.domNode.querySelector("[data-attach='agentSelectNode']");
            if (agentSelectNode) {
                this._agentSelect = new Select({
                    options: options,
                    style: "width:100%;"
                }, agentSelectNode);
            }
        },

        _initReasonField: function () {
            var reasonNode = this.domNode.querySelector("[data-attach='reasonNode']");
            if (reasonNode) {
                this._reasonTextarea = new Textarea({
                    rows: 3,
                    style: "width:100%;",
                    placeholder: "Transfer reason / notes for receiving agent..."
                }, reasonNode);
            }
        },

        _wireButtons: function () {
            var self = this;

            var confirmBtn = this.domNode.querySelector("[data-attach='confirmBtn']");
            if (confirmBtn) {
                this.own(on(confirmBtn, "click", lang.hitch(this, "_onConfirmTransfer")));
            }

            var cancelBtn = this.domNode.querySelector("[data-attach='cancelBtn']");
            if (cancelBtn) {
                this.own(on(cancelBtn, "click", function () { self.hide(); }));
            }
        },

        /**
         * Handle transfer confirmation.
         *
         * LEGACY: No error handling on the transferCall() promise.
         * TODO: Add .catch() / error handler; show Angular Material snackbar on failure.
         */
        _onConfirmTransfer: function () {
            var targetAgentId = this._agentSelect
                ? this._agentSelect.get("value") : "";

            if (!targetAgentId) {
                alert("Please select an agent to transfer to.");
                return;
            }

            var self = this;

            // LEGACY: No error handling here — see CallService.transferCall().
            // TODO: Add .then(null, errorHandler) or use async/await in Angular service.
            CallService.transferCall(this.call.callId, targetAgentId).then(
                function () {
                    topic.publish("callcenter/call/transferred", {
                        callId:        self.call.callId,
                        fromAgentId:   self.agentId,
                        toAgentId:     targetAgentId
                    });
                    topic.publish("callcenter/notification", {
                        message: "Call transferred successfully.",
                        level:   "success"
                    });
                    self.hide();
                    topic.publish("callcenter/call/ended", {
                        callId: self.call.callId
                    });
                }
                // LEGACY: No error callback — intentional gap.
            );
        }
    });
});
