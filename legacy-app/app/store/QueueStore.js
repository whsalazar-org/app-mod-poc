/**
 * app/store/QueueStore.js — Observable live call queue store.
 *
 * LEGACY: dojo/store/Observable wrapping dojo/store/Memory.
 * TODO: Replace with RxJS BehaviorSubject<Call[]> or NgRx queue state slice.
 */
define([
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dojo/topic"
], function (Memory, Observable, topic) {
    "use strict";

    var _idCounter = 1;

    // Inner memory store.
    var memoryStore = new Memory({
        idProperty: "callId",
        data: []
    });

    // Wrap with Observable so that query result sets update automatically.
    // LEGACY: dojo/store/Observable — pushes updates to live query result sets.
    // TODO: Replace with RxJS Observable streams and Angular async pipe.
    var store = Observable(memoryStore);

    /**
     * Add a new inbound call to the queue.
     *
     * @param {Object} callData - Call details (caller, phone, etc.)
     * @returns {string} The assigned callId.
     */
    store.addCall = function (callData) {
        var callId = "Q" + (_idCounter++);
        var call = {
            callId:     callId,
            callerId:   callData.callerId   || "Unknown",
            callerPhone: callData.callerPhone || "",
            callerName:  callData.callerName  || "Unknown Caller",
            queuedAt:   new Date().toISOString(),
            status:     "queued",
            priority:   callData.priority   || "normal",
            skillRequired: callData.skillRequired || "general"
        };
        this.add(call);

        // LEGACY: Magic string topic name — should be a constant.
        // TODO: Replace with NgRx action dispatch.
        topic.publish("callcenter/queue/updated", { action: "add", call: call });
        return callId;
    };

    /**
     * Remove a call from the queue (e.g., after it is answered or abandoned).
     *
     * @param {string} callId
     */
    store.removeCall = function (callId) {
        var call = this.get(callId);
        if (!call) {
            console.warn("[QueueStore] removeCall: callId not found:", callId);
            return;
        }
        this.remove(callId);
        topic.publish("callcenter/queue/updated", { action: "remove", callId: callId });
    };

    /**
     * Update the status of a queued call (e.g., "queued" → "ringing").
     *
     * @param {string} callId
     * @param {string} newStatus
     */
    store.updateCallStatus = function (callId, newStatus) {
        var call = this.get(callId);
        if (!call) {
            console.warn("[QueueStore] updateCallStatus: callId not found:", callId);
            return;
        }
        call.status = newStatus;
        this.put(call);
        topic.publish("callcenter/queue/updated", {
            action:  "update",
            callId:  callId,
            status:  newStatus
        });
    };

    /**
     * Get all calls currently in the queue.
     * @returns {Array}
     */
    store.getAllQueued = function () {
        var results = [];
        this.query({}).forEach(function (call) {
            results.push(call);
        });
        return results;
    };

    // Seed with a couple of demo calls.
    store.addCall({ callerPhone: "5551112222", callerName: "John Doe",   priority: "normal",   skillRequired: "billing"   });
    store.addCall({ callerPhone: "5553334444", callerName: "Jane Smith", priority: "high",     skillRequired: "technical" });
    store.addCall({ callerPhone: "5555556666", callerName: "Mike Brown", priority: "normal",   skillRequired: "general"   });

    return store;
});
