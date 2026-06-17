/**
 * app/config.js — Application configuration.
 *
 * LEGACY: Plain AMD module returning a config object.
 * TODO: Replace with Angular environment files (environment.ts / environment.prod.ts).
 */
define([], function () {
    "use strict";

    return {
        // API base URL
        // LEGACY: Hard-coded URL — no environment-specific build.
        // TODO: Use Angular environment variables with build configurations.
        apiBaseUrl: "/api",

        // Call queue poll interval in milliseconds.
        // LEGACY: Polling pattern — no WebSocket / SSE.
        // TODO: Replace with RxJS WebSocketSubject or EventSource observable.
        queuePollInterval: 5000,

        // Customer search debounce delay in milliseconds.
        searchDebounceMs: 300,

        // Maximum number of call history records to show per page.
        callHistoryPageSize: 20,

        // Feature flags
        features: {
            enableTransfer:      true,
            enableCallRecording: false,  // not yet implemented
            enableChatPanel:     false   // future feature
        },

        // LEGACY: Magic strings for topic names scattered across the app.
        // TODO: Centralise in an Angular injection token or enum.
        topics: {
            callAnswered:    "callcenter/call/answered",
            callEnded:       "callcenter/call/ended",
            callTransferred: "callcenter/call/transferred",
            queueUpdated:    "callcenter/queue/updated",
            agentStatusChanged: "callcenter/agent/statusChanged",
            systemError:     "callcenter/error",
            notification:    "callcenter/notification"
        },

        // Agent availability statuses.
        agentStatuses: [
            { value: "available",    label: "Available" },
            { value: "busy",         label: "Busy" },
            { value: "break",        label: "On Break" },
            { value: "training",     label: "Training" },
            { value: "unavailable",  label: "Unavailable" }
        ],

        // Call disposition codes.
        dispositions: [
            { value: "resolved",       label: "Resolved" },
            { value: "escalated",      label: "Escalated" },
            { value: "callback",       label: "Callback Scheduled" },
            { value: "voicemail",      label: "Left Voicemail" },
            { value: "wrong_number",   label: "Wrong Number" },
            { value: "abandoned",      label: "Abandoned" }
        ]
    };
});
