/**
 * app/services/CallService.js — REST service for call operations.
 *
 * LEGACY: dojo/request/xhr with dojo/Deferred.
 * TODO: Replace with Angular injectable CallService using HttpClient + RxJS Observables.
 *
 * KNOWN ISSUES:
 *   - LEGACY: Uses lang.hitch extensively instead of arrow functions.
 *   - LEGACY: transferCall() has no error handling — intentional gap.
 *     TODO: Add error handling to transferCall().
 *   - LEGACY: All methods return dojo/Deferred, not native Promises.
 *     TODO: Return Observable<T> from Angular HttpClient.
 */
define([
    "dojo/request/xhr",
    "dojo/Deferred",
    "dojo/_base/lang",
    "app/config",
    "app/services/AuthService"
], function (xhr, Deferred, lang, config, AuthService) {
    "use strict";

    var BASE_URL = config.apiBaseUrl + "/calls";

    /**
     * Build common request headers.
     * LEGACY: Manual header construction — no HTTP interceptor.
     * TODO: Use Angular HttpInterceptor to attach auth headers automatically.
     */
    function _headers() {
        return {
            "Content-Type":  "application/json",
            "Accept":        "application/json",
            "Authorization": "Bearer " + AuthService.getToken()
        };
    }

    /**
     * Internal helper: wrap an xhr call in a Deferred.
     * LEGACY: Dojo Deferred — not native Promise or Observable.
     */
    function _request(method, url, data) {
        var deferred = new Deferred();
        var opts = {
            method:  method,
            handleAs: "json",
            headers: _headers()
        };
        if (data) {
            opts.data = JSON.stringify(data);
        }

        xhr(url, opts).then(
            lang.hitch(deferred, deferred.resolve),
            lang.hitch(deferred, deferred.reject)
        );

        return deferred.promise;
    }

    return {

        /**
         * Answer an incoming call.
         *
         * @param {string} callId
         * @returns {dojo/promise/Promise}
         */
        answerCall: function (callId) {
            return _request("POST", BASE_URL + "/" + callId + "/answer", {
                agentId: AuthService.getCurrentAgentId()
            });
        },

        /**
         * Place the current call on hold.
         *
         * @param {string} callId
         * @returns {dojo/promise/Promise}
         */
        holdCall: function (callId) {
            return _request("POST", BASE_URL + "/" + callId + "/hold", {});
        },

        /**
         * Transfer a call to another agent.
         *
         * LEGACY: No error handling — if the transfer fails, the caller gets
         *         no feedback and the call state may be inconsistent.
         * TODO: Add error handling; publish callcenter/error topic on failure.
         *
         * @param {string} callId
         * @param {string} targetAgentId
         * @returns {dojo/promise/Promise}
         */
        transferCall: function (callId, targetAgentId) {
            // LEGACY: No .then(null, errorHandler) here — intentional missing error handling.
            return _request("POST", BASE_URL + "/" + callId + "/transfer", {
                targetAgentId: targetAgentId
            });
        },

        /**
         * End the current call and save the disposition.
         *
         * @param {string} callId
         * @param {string} disposition  - One of config.dispositions[].value
         * @param {string} [notes]      - Free-text call notes
         * @returns {dojo/promise/Promise}
         */
        endCall: function (callId, disposition, notes) {
            return _request("POST", BASE_URL + "/" + callId + "/end", {
                disposition: disposition,
                notes:       notes || ""
            });
        },

        /**
         * Retrieve call details.
         *
         * @param {string} callId
         * @returns {dojo/promise/Promise}
         */
        getCall: function (callId) {
            return _request("GET", BASE_URL + "/" + callId);
        }
    };
});
