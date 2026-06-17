/**
 * app/widgets/CallHistory.js — Paginated call history widget for a customer.
 *
 * LEGACY: _WidgetBase + _TemplatedMixin with manual pagination.
 * TODO: Replace with Angular CallHistoryComponent using mat-paginator and mat-table.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./CallHistory.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "app/store/CallStore",
    "app/utils/formatters",
    "app/config"
], function (
    declare, lang, domConstruct, domStyle, on, topic, template,
    _WidgetBase, _TemplatedMixin,
    CallStore, formatters, config
) {
    "use strict";

    return declare("app.widgets.CallHistory", [_WidgetBase, _TemplatedMixin], {

        templateString: template,

        // Currently displayed customer ID.
        _customerId: null,

        // All fetched history records.
        _records: null,

        // Pagination state.
        _currentPage: 1,
        _pageSize:    0,

        postCreate: function () {
            this.inherited(arguments);
            this._pageSize = config.callHistoryPageSize || 20;
            this._records  = [];
            this._showEmptyState();
        },

        startup: function () {
            this.inherited(arguments);
        },

        /**
         * Load call history for a customer.
         * LEGACY: Dojo QueryResults (thenable) from CallStore.
         * TODO: Replace with Observable<CallRecord[]> from a CallHistoryService.
         *
         * @param {string} customerId
         */
        loadHistory: function (customerId) {
            if (!customerId) { return; }
            this._customerId  = customerId;
            this._currentPage = 1;
            this._records     = [];

            var self = this;

            domStyle.set(this.historyBodyNode, "opacity", "0.5");

            // LEGACY: Dojo QueryResults — not a Promise or Observable.
            var results = CallStore.query({ customerId: customerId });
            results.then(
                function (records) {
                    self._records = records || [];
                    domStyle.set(self.historyBodyNode, "opacity", "1");
                    self._renderPage();
                    self._updatePagination();
                },
                function (err) {
                    console.error("[CallHistory] loadHistory failed:", err);
                    domStyle.set(self.historyBodyNode, "opacity", "1");
                    self._showEmptyState();
                }
            );
        },

        /**
         * Render the current page of records into the table body.
         * LEGACY: Manual DOM construction.
         * TODO: Use Angular template with *ngFor and async pipe.
         */
        _renderPage: function () {
            if (!this.historyBodyNode) { return; }
            domConstruct.empty(this.historyBodyNode);

            var start   = (this._currentPage - 1) * this._pageSize;
            var end     = start + this._pageSize;
            var pageRecs = this._records.slice(start, end);

            if (pageRecs.length === 0) {
                this._showEmptyState();
                return;
            }

            pageRecs.forEach(lang.hitch(this, function (record) {
                var tr = domConstruct.create("tr", {
                    style: "border-bottom:1px solid #f0f0f0;"
                }, this.historyBodyNode);

                domConstruct.create("td", {
                    innerHTML: formatters.formatTimestamp(record.startTime),
                    style: "padding:5px 8px; font-size:11px; color:#555;"
                }, tr);

                domConstruct.create("td", {
                    innerHTML: formatters.formatDuration(record.durationSeconds || 0),
                    style: "padding:5px 4px; font-size:11px;"
                }, tr);

                domConstruct.create("td", {
                    innerHTML: record.agentName || "—",
                    style: "padding:5px 4px; font-size:11px; color:#555;"
                }, tr);

                domConstruct.create("td", {
                    innerHTML: formatters.formatCallStatus(record.disposition),
                    style: "padding:5px 4px; font-size:11px;"
                }, tr);

                domConstruct.create("td", {
                    innerHTML: record.notes
                        ? ('<span title="' + record.notes + '">&#128221;</span>')
                        : "—",
                    style: "padding:5px 4px; font-size:11px; text-align:center;"
                }, tr);
            }));
        },

        /**
         * Update pagination controls (page N of M display).
         */
        _updatePagination: function () {
            var totalPages = Math.max(1,
                Math.ceil(this._records.length / this._pageSize));

            if (this.pageInfoNode) {
                this.pageInfoNode.innerHTML =
                    "Page " + this._currentPage + " of " + totalPages;
            }
            if (this.prevBtnNode) {
                this.prevBtnNode.disabled = (this._currentPage <= 1);
            }
            if (this.nextBtnNode) {
                this.nextBtnNode.disabled = (this._currentPage >= totalPages);
            }
        },

        _onPrevPage: function () {
            if (this._currentPage > 1) {
                this._currentPage--;
                this._renderPage();
                this._updatePagination();
            }
        },

        _onNextPage: function () {
            var totalPages = Math.ceil(this._records.length / this._pageSize);
            if (this._currentPage < totalPages) {
                this._currentPage++;
                this._renderPage();
                this._updatePagination();
            }
        },

        /**
         * Show an empty-state message in the table body.
         */
        _showEmptyState: function () {
            if (!this.historyBodyNode) { return; }
            domConstruct.empty(this.historyBodyNode);
            var tr = domConstruct.create("tr", {}, this.historyBodyNode);
            domConstruct.create("td", {
                colspan: 5,
                innerHTML: "<em style='color:#999;'>No call history for this customer.</em>",
                style: "text-align:center; padding:16px; font-size:12px;"
            }, tr);
        }
    });
});
