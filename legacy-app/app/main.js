/**
 * app/main.js — Application bootstrap entry point.
 *
 * LEGACY: AMD define() with dojo/domReady! plugin.
 * TODO: Replace with Angular main.ts + bootstrapApplication().
 *
 * Old pattern (kept as comment for reference):
 *   dojo.ready(function() { ... });
 */
define([
    "dojo/dom",
    "dojo/topic",
    "dojo/domReady!",
    "app/widgets/CallCenterApp",
    "app/services/AuthService",
    "app/config"
], function (dom, topic, domReady, CallCenterApp, AuthService, config) {
    "use strict";

    // LEGACY: Global variable leak — exposes app instance on window for debugging.
    // TODO: Remove global; use Angular's dependency injection instead.
    window.callCenterApp = null;

    /**
     * Global error handler via dojo/topic.
     * LEGACY: Magic string topic name instead of a constant.
     * TODO: Replace with Angular ErrorHandler service.
     */
    topic.subscribe("callcenter/error", function (payload) {
        console.error("[CallCenter] Global error:", payload.message, payload.error);
        // LEGACY: alert() for critical errors — no toast/snackbar component.
        if (payload.critical) {
            alert("A critical error occurred: " + payload.message);
        }
    });

    /**
     * Bootstrap the application.
     * The dojo/domReady! plugin ensures the DOM is ready before this runs.
     */
    function bootstrap() {
        var container = dom.byId("app-container");
        if (!container) {
            console.error("[CallCenter] #app-container not found in DOM.");
            return;
        }

        // Check authentication state before rendering.
        if (!AuthService.isAuthenticated()) {
            AuthService.showLoginForm(container);
            return;
        }

        // Instantiate the root widget and place it in the container.
        var app = new CallCenterApp({
            agentId: AuthService.getCurrentAgentId(),
            config:  config
        }, container);

        app.startup();

        // LEGACY: Global reference — see TODO above.
        window.callCenterApp = app;

        console.log("[CallCenter] CallCenterApp started. Agent:", AuthService.getCurrentAgentId());
    }

    // dojo/domReady! has already fired by the time this factory runs.
    bootstrap();
});
