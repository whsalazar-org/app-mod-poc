/**
 * app/services/CustomerService.js — REST service for customer lookup.
 *
 * LEGACY: dojo/request/xhr with dojo/Deferred.
 * TODO: Replace with Angular CustomerService using HttpClient.
 */
define([
    "dojo/request/xhr",
    "dojo/Deferred",
    "dojo/_base/lang",
    "app/config",
    "app/services/AuthService"
], function (xhr, Deferred, lang, config, AuthService) {
    "use strict";

    var BASE_URL = config.apiBaseUrl + "/customers";

    function _headers() {
        return {
            "Content-Type":  "application/json",
            "Accept":        "application/json",
            "Authorization": "Bearer " + AuthService.getToken()
        };
    }

    return {

        /**
         * Look up a customer by phone number.
         *
         * @param {string} phone - Raw phone number string.
         * @returns {dojo/promise/Promise<Object>}
         */
        lookupByPhone: function (phone) {
            var deferred = new Deferred();
            var digits = phone.replace(/\D/g, "");

            xhr.get(BASE_URL + "/search", {
                query: { phone: digits },
                handleAs: "json",
                headers:  _headers()
            }).then(
                function (data) {
                    // Return the first match (or null).
                    deferred.resolve((data && data.length > 0) ? data[0] : null);
                },
                lang.hitch(deferred, deferred.reject)
            );

            return deferred.promise;
        },

        /**
         * Search customers by a general query string (name, phone, account).
         *
         * @param {string} query
         * @returns {dojo/promise/Promise<Array>}
         */
        search: function (query) {
            var deferred = new Deferred();

            xhr.get(BASE_URL + "/search", {
                query: { q: query },
                handleAs: "json",
                headers:  _headers()
            }).then(
                lang.hitch(deferred, deferred.resolve),
                lang.hitch(deferred, deferred.reject)
            );

            return deferred.promise;
        },

        /**
         * Get a customer by ID.
         *
         * @param {string} customerId
         * @returns {dojo/promise/Promise<Object>}
         */
        getById: function (customerId) {
            var deferred = new Deferred();

            xhr.get(BASE_URL + "/" + customerId, {
                handleAs: "json",
                headers:  _headers()
            }).then(
                lang.hitch(deferred, deferred.resolve),
                lang.hitch(deferred, deferred.reject)
            );

            return deferred.promise;
        }
    };
});
