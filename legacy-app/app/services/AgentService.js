/**
 * app/services/AgentService.js — REST service for agent status management.
 *
 * LEGACY: dojo/request/xhr with dojo/Deferred and lang.hitch.
 * TODO: Replace with Angular AgentService using HttpClient + RxJS.
 */
define([
    "dojo/request/xhr",
    "dojo/Deferred",
    "dojo/_base/lang",
    "app/config",
    "app/services/AuthService"
], function (xhr, Deferred, lang, config, AuthService) {
    "use strict";

    var BASE_URL = config.apiBaseUrl + "/agents";

    function _headers() {
        return {
            "Content-Type":  "application/json",
            "Accept":        "application/json",
            "Authorization": "Bearer " + AuthService.getToken()
        };
    }

    return {

        /**
         * Get all agents and their current availability.
         *
         * @returns {dojo/promise/Promise<Array>}
         */
        getAll: function () {
            var deferred = new Deferred();
            xhr.get(BASE_URL, {
                handleAs: "json",
                headers:  _headers()
            }).then(
                lang.hitch(deferred, deferred.resolve),
                lang.hitch(deferred, deferred.reject)
            );
            return deferred.promise;
        },

        /**
         * Update the calling agent's status.
         *
         * @param {string} agentId
         * @param {string} status
         * @returns {dojo/promise/Promise}
         */
        updateStatus: function (agentId, status) {
            var deferred = new Deferred();
            xhr.put(BASE_URL + "/" + agentId + "/status", {
                data:     JSON.stringify({ status: status }),
                handleAs: "json",
                headers:  _headers()
            }).then(
                lang.hitch(deferred, deferred.resolve),
                lang.hitch(deferred, deferred.reject)
            );
            return deferred.promise;
        },

        /**
         * Get performance metrics for an agent.
         *
         * @param {string} agentId
         * @returns {dojo/promise/Promise<Object>}
         */
        getMetrics: function (agentId) {
            var deferred = new Deferred();
            xhr.get(BASE_URL + "/" + agentId + "/metrics", {
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
