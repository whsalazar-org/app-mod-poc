/**
 * app/store/AgentStore.js — In-memory store of call center agents.
 *
 * LEGACY: dojo/store/Memory with hard-coded seed data.
 * TODO: Replace with NgRx entity store populated from AgentService HTTP call.
 */
define([
    "dojo/store/Memory"
], function (Memory) {
    "use strict";

    var agents = [
        {
            agentId:      "A001",
            firstName:    "Maria",
            lastName:     "Gonzalez",
            extension:    "2201",
            team:         "billing",
            skills:       ["billing", "general"],
            status:       "available",
            callsHandled: 0,
            avgHandleTime: 0
        },
        {
            agentId:      "A002",
            firstName:    "James",
            lastName:     "Park",
            extension:    "2202",
            team:         "technical",
            skills:       ["technical", "tier2"],
            status:       "available",
            callsHandled: 0,
            avgHandleTime: 0
        },
        {
            agentId:      "A003",
            firstName:    "Susan",
            lastName:     "Williams",
            extension:    "2203",
            team:         "sales",
            skills:       ["sales", "general"],
            status:       "break",
            callsHandled: 0,
            avgHandleTime: 0
        },
        {
            agentId:      "A004",
            firstName:    "David",
            lastName:     "Chen",
            extension:    "2204",
            team:         "technical",
            skills:       ["technical", "billing"],
            status:       "busy",
            callsHandled: 0,
            avgHandleTime: 0
        }
    ];

    // LEGACY: dojo/store/Memory — synchronous, in-memory only.
    // TODO: Replace with Angular service backed by HttpClient + NgRx.
    var store = new Memory({
        idProperty: "agentId",
        data: agents
    });

    /**
     * Get all available agents (status === "available").
     * LEGACY: Manual filter loop instead of an RxJS stream.
     */
    store.getAvailable = function () {
        var available = [];
        var results = this.query({});
        results.forEach(function (agent) {
            if (agent.status === "available") {
                available.push(agent);
            }
        });
        return available;
    };

    /**
     * Update an agent's status.
     */
    store.updateStatus = function (agentId, newStatus) {
        var agent = this.get(agentId);
        if (!agent) {
            console.warn("[AgentStore] Agent not found:", agentId);
            return;
        }
        agent.status = newStatus;
        this.put(agent);
    };

    return store;
});
