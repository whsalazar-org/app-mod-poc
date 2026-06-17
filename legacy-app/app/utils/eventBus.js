/**
 * app/utils/eventBus.js — Thin wrapper around dojo/topic for pub/sub messaging.
 *
 * LEGACY: dojo/topic-based event bus — global, stringly-typed messaging.
 * TODO: Replace with a real event bus (see below).
 *       In Angular, use:
 *         - A shared service with RxJS Subject<T> for typed events
 *         - NgRx Actions for state-driven events
 *         - Angular EventEmitter for component → parent communication
 *
 * Usage (LEGACY):
 *   var eventBus = require("app/utils/eventBus");
 *   var handle = eventBus.subscribe("callcenter/call/answered", function(payload) { ... });
 *   eventBus.publish("callcenter/call/answered", { call: callObj });
 *   handle.remove(); // cleanup
 */
define([
    "dojo/topic"
], function (topic) {
    "use strict";

    return {

        /**
         * Publish an event to a topic.
         *
         * LEGACY: Magic string topic names — no type safety.
         * TODO: Use typed NgRx actions or a typed RxJS Subject.
         *
         * @param {string} topicName - The topic channel name.
         * @param {*}      data      - Payload to pass to subscribers.
         */
        publish: function (topicName, data) {
            topic.publish(topicName, data);
        },

        /**
         * Subscribe to a topic.
         * Returns a handle with a `.remove()` method for cleanup.
         *
         * LEGACY: Must manually call handle.remove() in widget destroy().
         * TODO: Use RxJS subscription with takeUntilDestroyed() operator.
         *
         * @param {string}   topicName - The topic channel name.
         * @param {Function} callback  - Handler function(payload).
         * @returns {{ remove: function }} Subscription handle.
         */
        subscribe: function (topicName, callback) {
            return topic.subscribe(topicName, callback);
        }
    };
});
