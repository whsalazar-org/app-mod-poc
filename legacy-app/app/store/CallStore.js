/**
 * app/store/CallStore.js — REST-backed store for active and recent calls.
 *
 * LEGACY: dojo/store/JsonRest wrapped with dojo/store/Cache.
 * TODO: Replace with Angular HttpClient service + NgRx effects for caching.
 */
define([
    "dojo/store/JsonRest",
    "dojo/store/Memory",
    "dojo/store/Cache"
], function (JsonRest, Memory, Cache) {
    "use strict";

    // LEGACY: dojo/store/JsonRest — maps REST verbs to store CRUD operations.
    // GET /api/calls        → query()
    // GET /api/calls/{id}   → get(id)
    // POST /api/calls       → add()
    // PUT /api/calls/{id}   → put()
    // DELETE /api/calls/{id}→ remove()
    var restStore = new JsonRest({
        target: "/api/calls",
        idProperty: "callId",
        headers: {
            "Content-Type": "application/json",
            "Accept":        "application/json"
        }
    });

    // Local memory cache to avoid repeated REST calls for known records.
    // LEGACY: Manual cache strategy — no HTTP cache-control headers or service worker.
    var cacheStore = new Memory({ idProperty: "callId" });

    // Wrap restStore with cache: reads come from cacheStore, writes go to restStore.
    var store = new Cache(restStore, cacheStore);

    /**
     * Fetch calls for a specific agent.
     * Returns a dojo/store QueryResults (thenable array).
     * LEGACY: Dojo QueryResults — not an RxJS Observable.
     */
    store.getCallsForAgent = function (agentId) {
        return this.query({ agentId: agentId });
    };

    /**
     * Fetch active (in-progress) calls.
     */
    store.getActiveCalls = function () {
        return this.query({ status: "active" });
    };

    return store;
});
