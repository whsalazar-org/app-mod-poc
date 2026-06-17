/**
 * app/widgets/CustomerSearch.js — Customer search widget.
 *
 * LEGACY: Dijit widget with manual debounce and deprecated XHR.
 * TODO: Replace with Angular CustomerSearchComponent + RxJS debounceTime operator.
 *
 * KNOWN ISSUES:
 *   1. LEGACY: Uses dojo/_base/xhr (deprecated since Dojo 1.8) for the remote search.
 *      TODO: Replace with dojo/request/xhr or Angular HttpClient.
 *
 *   2. LEGACY: _formatPhone() method duplicates logic from app/utils/formatters.js.
 *      This is an intentional code smell — two sources of truth for the same logic.
 *      TODO: Remove this method and import formatters.formatPhoneNumber() instead.
 *
 *   3. LEGACY: Raw setTimeout/clearTimeout for debounce — no RxJS.
 *      TODO: Replace with RxJS Subject + debounceTime(300) + switchMap().
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/xhr",           // LEGACY: deprecated — use dojo/request/xhr
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./CustomerSearch.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/form/TextBox",
    "app/store/CustomerStore"
], function (
    declare, lang, xhr, domConstruct, domClass, domStyle, on, topic, template,
    _WidgetBase, _TemplatedMixin, TextBox, CustomerStore
) {
    "use strict";

    return declare("app.widgets.CustomerSearch", [_WidgetBase, _TemplatedMixin], {

        templateString: template,

        // Search debounce timer handle.
        // LEGACY: Raw setTimeout — not using RxJS or any reactive approach.
        _debounceHandle: null,

        // Dijit TextBox for search input.
        _searchInput: null,

        postCreate: function () {
            this.inherited(arguments);
            this._initSearchInput();
        },

        startup: function () {
            this.inherited(arguments);
        },

        /**
         * Initialise the Dijit TextBox search input.
         * LEGACY: Programmatic Dijit TextBox creation.
         * TODO: Use Angular Material mat-form-field + mat-input.
         */
        _initSearchInput: function () {
            var self = this;

            this._searchInput = new TextBox({
                placeholder: "Name, phone or account#",
                style: "width:100%;"
            }, this.searchInputNode);

            // LEGACY: dojo/on for input events.
            this.own(
                on(this._searchInput, "input", function () {
                    self._onSearchInput();
                })
            );

            this.own(
                on(this._searchInput.domNode, "keydown", function (evt) {
                    if (evt.keyCode === 13) { // Enter key
                        self._doSearch(self._searchInput.get("value"));
                    }
                })
            );
        },

        /**
         * Handle input event with debounce.
         * LEGACY: Raw setTimeout for debounce.
         * TODO: Replace with RxJS Subject + debounceTime(300).
         */
        _onSearchInput: function () {
            // Cancel previous debounce timer.
            if (this._debounceHandle) {
                clearTimeout(this._debounceHandle);
                this._debounceHandle = null;
            }

            var self = this;
            var query = this._searchInput.get("value");

            if (!query || query.length < 2) {
                this._clearResults();
                return;
            }

            // LEGACY: setTimeout debounce — 300ms.
            // TODO: Replace with:
            //   this.searchInput$ = new Subject<string>();
            //   this.searchInput$.pipe(debounceTime(300), switchMap(q => this.customerSvc.search(q)))
            //       .subscribe(results => this.renderResults(results));
            this._debounceHandle = setTimeout(function () {
                self._doSearch(query);
            }, 300);
        },

        /**
         * Execute the search — first tries local CustomerStore, then falls back
         * to a remote XHR call using the deprecated dojo/_base/xhr API.
         *
         * LEGACY: dojo/_base/xhr is deprecated since Dojo 1.8.
         *         Also, this duplicates the phone formatting logic from formatters.js.
         * TODO: Replace with Angular HttpClient + CustomerService.search().
         *
         * @param {string} query
         */
        _doSearch: function (query) {
            var self = this;

            // First try the local store.
            var localResults = CustomerStore.search(query);
            if (localResults.length > 0) {
                self._renderResults(localResults);
                return;
            }

            // Fall back to remote API using deprecated XHR.
            // LEGACY: dojo/_base/xhr (deprecated) — should use dojo/request/xhr.
            // TODO: Replace with Angular HttpClient.get<Customer[]>('/api/customers?q=' + query)
            xhr.get({
                url: "/api/customers",
                content: { q: query },
                handleAs: "json",
                load: function (data) {
                    self._renderResults(data || []);
                },
                error: function (err) {
                    console.error("[CustomerSearch] Remote search failed:", err);
                    self._renderResults([]);
                }
            });
        },

        /**
         * Render a list of customer results.
         * LEGACY: Manual DOM construction.
         * TODO: Use Angular *ngFor in template.
         *
         * @param {Array} results
         */
        _renderResults: function (results) {
            var container = this.resultsNode;
            domConstruct.empty(container);

            if (!results || results.length === 0) {
                domConstruct.create("div", {
                    innerHTML: "<em style='color:#999;'>No customers found.</em>",
                    style: "padding:8px; font-size:12px;"
                }, container);
                return;
            }

            var self = this;
            results.forEach(function (customer) {
                var row = domConstruct.create("div", {
                    "class": "cc-customer-result",
                    style: "padding:6px 10px; cursor:pointer; border-bottom:1px solid #eee; font-size:12px;"
                }, container);

                // LEGACY: _formatPhone duplicates formatters.formatPhoneNumber logic.
                // TODO: Import and use formatters.formatPhoneNumber() here.
                row.innerHTML =
                    "<strong>" + customer.firstName + " " + customer.lastName + "</strong>" +
                    " &mdash; " + self._formatPhone(customer.phone) +
                    "<br><span style='color:#888;'>Acct: " + customer.accountNumber + " | Tier: " +
                    customer.tier + "</span>";

                self.own(
                    on(row, "click", function () {
                        self._onCustomerSelected(customer);
                    })
                );

                // Hover style — LEGACY: inline JS hover instead of CSS :hover.
                self.own(on(row, "mouseover", function () {
                    domStyle.set(row, "background", "#e8f0fe");
                }));
                self.own(on(row, "mouseout", function () {
                    domStyle.set(row, "background", "");
                }));
            });
        },

        /**
         * Handle customer selection.
         * Publishes to dojo/topic so other widgets can react.
         *
         * LEGACY: Magic string topic name.
         * TODO: Dispatch NgRx action or call CustomerStateService.selectCustomer().
         *
         * @param {Object} customer
         */
        _onCustomerSelected: function (customer) {
            topic.publish("callcenter/customer/selected", {
                customerId: customer.customerId,
                customer:   customer
            });

            // Highlight selected.
            if (this.searchInputNode && this._searchInput) {
                this._searchInput.set("value",
                    customer.firstName + " " + customer.lastName);
            }
            this._clearResults();
        },

        /**
         * Clear the results list.
         */
        _clearResults: function () {
            if (this.resultsNode) {
                domConstruct.empty(this.resultsNode);
            }
        },

        /**
         * _formatPhone — formats a 10-digit phone string to (xxx) xxx-xxxx.
         *
         * LEGACY: Duplicated from app/utils/formatters.js — intentional code smell.
         * TODO: Remove this method; use formatters.formatPhoneNumber() instead.
         *
         * @param {string} phone - Raw phone number string.
         * @returns {string} Formatted phone number.
         */
        _formatPhone: function (phone) {
            if (!phone) { return ""; }
            var digits = phone.replace(/\D/g, "");
            if (digits.length === 10) {
                return "(" + digits.substring(0, 3) + ") " +
                       digits.substring(3, 6) + "-" +
                       digits.substring(6);
            }
            return phone;
        }
    });
});
