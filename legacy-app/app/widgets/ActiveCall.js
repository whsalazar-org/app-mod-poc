/**
 * app/widgets/ActiveCall.js — Active call details and disposition widget.
 *
 * LEGACY: _WidgetBase + _TemplatedMixin with manual Deferred-based async.
 * TODO: Replace with Angular ActiveCallComponent using RxJS and Angular Material forms.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/string",
    "dojo/Deferred",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/topic",
    "dojo/text!./ActiveCall.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Select",
    "dijit/form/Textarea",
    "app/services/CallService",
    "app/services/CustomerService",
    "app/store/CustomerStore",
    "app/utils/formatters",
    "app/config"
], function (
    declare, lang, string, Deferred, domStyle, domClass, topic, template,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Select, Textarea,
    CallService, CustomerService, CustomerStore, formatters, config
) {
    "use strict";

    return declare("app.widgets.ActiveCall",
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString: template,

        agentId:  "",

        // Current active call object.
        _currentCall: null,

        // Current customer object.
        _currentCustomer: null,

        // Call timer.
        _timerHandle:   null,
        _timerSeconds:  0,

        // Dijit form widgets.
        _dispositionSelect: null,
        _notesTextarea:     null,

        postCreate: function () {
            this.inherited(arguments);
            this._initFormWidgets();
            this._showIdleState();
        },

        startup: function () {
            this.inherited(arguments);
        },

        /**
         * Initialise Dijit form widgets for the disposition form.
         * LEGACY: Programmatic Dijit widget instantiation.
         * TODO: Use Angular Reactive Forms with mat-select and mat-form-field.
         */
        _initFormWidgets: function () {
            var options = config.dispositions.map(function (d) {
                return { value: d.value, label: d.label };
            });
            options.unshift({ value: "", label: "— Select Disposition —" });

            this._dispositionSelect = new Select({
                options: options,
                style: "width:200px;"
            }, this.dispositionSelectNode);

            this._notesTextarea = new Textarea({
                rows: 4,
                style: "width:100%; box-sizing:border-box;",
                placeholder: "Enter call notes..."
            }, this.notesNode);
        },

        /**
         * Load a call into the active call panel.
         * Called by CallCenterApp when a call is answered from the queue.
         *
         * @param {Object} call - The call object from QueueStore.
         */
        loadCall: function (call) {
            this._currentCall = call;
            this._timerSeconds = 0;

            // Update header fields.
            if (this.callerNameNode) {
                this.callerNameNode.innerHTML = call.callerName || "Unknown Caller";
            }
            if (this.callerPhoneNode) {
                this.callerPhoneNode.innerHTML = formatters.formatPhoneNumber(call.callerPhone || "");
            }
            if (this.callIdNode) {
                this.callIdNode.innerHTML = "Call #" + call.callId;
            }
            if (this.callStatusNode) {
                this.callStatusNode.innerHTML = formatters.formatCallStatus("active");
            }

            // Show the active call panel; hide idle message.
            domStyle.set(this.idleMessageNode,  "display", "none");
            domStyle.set(this.callDetailsNode,  "display", "block");

            // Start the call timer.
            this._startTimer();

            // Perform async customer lookup.
            this._lookupCustomer(call.callerPhone);
        },

        /**
         * Set customer context (called from CustomerSearch selection).
         * @param {Object} customer
         */
        setCustomer: function (customer) {
            this._currentCustomer = customer;
            this._renderCustomer(customer);
        },

        /**
         * Clear the active call panel after the call ends.
         */
        clearCall: function () {
            this._stopTimer();
            this._currentCall     = null;
            this._currentCustomer = null;
            this._timerSeconds    = 0;

            if (this._dispositionSelect) {
                this._dispositionSelect.set("value", "");
            }
            if (this._notesTextarea) {
                this._notesTextarea.set("value", "");
            }

            this._showIdleState();
        },

        /**
         * Start the call duration timer.
         * LEGACY: Raw setInterval stored on this._timerHandle.
         * TODO: Use RxJS timer() with takeUntil(callEnded$) pipe.
         */
        _startTimer: function () {
            this._stopTimer();
            var self = this;
            this._timerHandle = setInterval(function () {
                self._timerSeconds++;
                if (self.callTimerNode) {
                    self.callTimerNode.innerHTML = formatters.formatDuration(self._timerSeconds);
                }
            }, 1000);
        },

        /**
         * Stop the call timer.
         */
        _stopTimer: function () {
            if (this._timerHandle) {
                clearInterval(this._timerHandle);
                this._timerHandle = null;
            }
            if (this.callTimerNode) {
                this.callTimerNode.innerHTML = "00:00";
            }
        },

        /**
         * Perform an async customer lookup by phone number.
         * LEGACY: dojo/Deferred — not a native Promise or RxJS Observable.
         * TODO: Replace with Angular service returning Observable<Customer>.
         *
         * @param {string} phone
         * @returns {dojo/Deferred}
         */
        _lookupCustomer: function (phone) {
            var deferred = new Deferred();
            var self = this;

            // Try local CustomerStore first.
            var localResults = CustomerStore.search(phone.replace(/\D/g, ""));
            if (localResults.length > 0) {
                self._renderCustomer(localResults[0]);
                deferred.resolve(localResults[0]);
                return deferred.promise;
            }

            // Fall back to remote CustomerService.
            // LEGACY: Deferred chaining — .then() on a Deferred, not a Promise.
            CustomerService.lookupByPhone(phone).then(
                function (customer) {
                    self._renderCustomer(customer);
                    deferred.resolve(customer);
                },
                function (err) {
                    console.warn("[ActiveCall] Customer lookup failed:", err);
                    self._renderCustomer(null);
                    deferred.reject(err);
                }
            );

            return deferred.promise;
        },

        /**
         * Render customer info in the panel.
         * LEGACY: Uses dojo/string.substitute for template formatting.
         * TODO: Use Angular template interpolation {{ customer.name }}.
         *
         * @param {Object|null} customer
         */
        _renderCustomer: function (customer) {
            if (!customer) {
                if (this.customerInfoNode) {
                    this.customerInfoNode.innerHTML =
                        "<em style='color:#999;'>No customer record found</em>";
                }
                return;
            }

            this._currentCustomer = customer;

            // LEGACY: dojo/string.substitute for string templating.
            // TODO: Replace with Angular template binding.
            var html = string.substitute(
                "<strong>${firstName} ${lastName}</strong><br>" +
                "Account: ${accountNumber}<br>" +
                "Phone: ${phone}<br>" +
                "Tier: <span style='text-transform:capitalize;'>${tier}</span>",
                {
                    firstName:     customer.firstName     || "",
                    lastName:      customer.lastName      || "",
                    accountNumber: customer.accountNumber || "—",
                    phone:         formatters.formatPhoneNumber(customer.phone || ""),
                    tier:          customer.tier           || "standard"
                }
            );

            if (this.customerInfoNode) {
                this.customerInfoNode.innerHTML = html;
            }
        },

        /**
         * Show the idle (no active call) state.
         */
        _showIdleState: function () {
            domStyle.set(this.callDetailsNode, "display", "none");
            domStyle.set(this.idleMessageNode, "display", "block");
        },

        /**
         * Handle "Hold" button click.
         * LEGACY: Calls CallService which returns dojo/Deferred.
         */
        _onHoldCall: function () {
            if (!this._currentCall) { return; }
            CallService.holdCall(this._currentCall.callId).then(
                function () {
                    topic.publish("callcenter/notification", {
                        message: "Call placed on hold.",
                        level: "info"
                    });
                },
                function (err) {
                    console.error("[ActiveCall] holdCall failed:", err);
                }
            );
        },

        /**
         * Handle "End Call" button click.
         * Validates disposition then calls CallService.endCall().
         */
        _onEndCall: function () {
            if (!this._currentCall) { return; }

            var disposition = this._dispositionSelect
                ? this._dispositionSelect.get("value") : "";
            var notes = this._notesTextarea
                ? this._notesTextarea.get("value") : "";

            if (!disposition) {
                alert("Please select a call disposition before ending the call.");
                return;
            }

            var self = this;
            CallService.endCall(this._currentCall.callId, disposition, notes).then(
                function () {
                    topic.publish("callcenter/call/ended", {
                        callId:     self._currentCall.callId,
                        customerId: self._currentCustomer
                            ? self._currentCustomer.customerId : null
                    });
                    self.clearCall();
                },
                function (err) {
                    console.error("[ActiveCall] endCall failed:", err);
                    topic.publish("callcenter/error", {
                        message: "Failed to end call. Please try again.",
                        error: err
                    });
                }
            );
        },

        /**
         * Handle "Transfer" button click — opens TransferDialog.
         * LEGACY: Dynamically requires TransferDialog to avoid circular dep.
         * TODO: Use Angular MatDialog.open() with a dialog component.
         */
        _onTransferCall: function () {
            if (!this._currentCall) { return; }
            var self = this;
            require(["app/widgets/TransferDialog"], function (TransferDialog) {
                var dialog = new TransferDialog({
                    call:    self._currentCall,
                    agentId: self.agentId
                });
                dialog.show();
            });
        },

        destroy: function () {
            this._stopTimer();
            this.inherited(arguments);
        }
    });
});
