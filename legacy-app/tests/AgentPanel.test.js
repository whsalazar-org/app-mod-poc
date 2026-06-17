/**
 * tests/AgentPanel.test.js — Basic DOH tests for AgentPanel widget.
 *
 * LEGACY: Dojo DOH (Dojo Object Harness) test framework.
 * TODO: Replace with Jest + Angular Testing Library tests.
 *
 * Run with: doh.runner.html?testModule=tests/AgentPanel.test
 */
require([
    "doh",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "app/widgets/AgentPanel",
    "app/store/AgentStore"
], function (doh, declare, domConstruct, AgentPanel, AgentStore) {
    "use strict";

    // Test fixtures.
    var TEST_AGENT_ID = "A001";
    var container;
    var widget;

    doh.register("AgentPanel", [

        {
            name: "setUp",
            setUp: function () {
                // Create a container div to host the widget.
                container = domConstruct.create("div", {}, document.body);
            },
            runTest: function () {
                // setUp only — no assertions here.
                doh.assertTrue(true);
            },
            tearDown: function () {
                // tearDown handled in individual tests.
            }
        },

        {
            name: "should instantiate without error",
            runTest: function () {
                widget = new AgentPanel({
                    agentId:   TEST_AGENT_ID,
                    agentName: "Maria Gonzalez",
                    extension: "2201",
                    status:    "available"
                }, container);

                doh.assertNotEqual(null, widget,
                    "AgentPanel should instantiate");
            }
        },

        {
            name: "should render agent name in the DOM",
            runTest: function () {
                doh.assertNotEqual(null, widget.agentNameNode,
                    "agentNameNode attach point should exist");
                doh.assertEqual("Maria Gonzalez", widget.agentNameNode.innerHTML,
                    "Agent name should be rendered in agentNameNode");
            }
        },

        {
            name: "should render extension in the DOM",
            runTest: function () {
                doh.assertNotEqual(null, widget.extensionNode,
                    "extensionNode attach point should exist");
                doh.assertEqual("Ext. 2201", widget.extensionNode.innerHTML,
                    "Extension should be rendered in extensionNode");
            }
        },

        {
            name: "should initialize with correct status",
            runTest: function () {
                doh.assertEqual("available", widget.status,
                    "Initial status should be 'available'");
            }
        },

        {
            name: "setStatus should update widget.status",
            runTest: function () {
                widget.setStatus("busy");
                doh.assertEqual("busy", widget.status,
                    "status should update after setStatus('busy')");
            }
        },

        {
            name: "setStatus should update statusIndicatorNode color",
            runTest: function () {
                widget.setStatus("available");
                var bg = widget.statusIndicatorNode
                    ? widget.statusIndicatorNode.style.backgroundColor : "";
                // "available" maps to #4caf50 — browsers may return rgb().
                doh.assertTrue(
                    bg === "#4caf50" || bg === "rgb(76, 175, 80)",
                    "Status indicator should show green for available; got: " + bg
                );
            }
        },

        {
            name: "should have a _statusSelect Dijit Select widget",
            runTest: function () {
                doh.assertNotEqual(null, widget._statusSelect,
                    "_statusSelect should be initialised after postCreate");
            }
        },

        {
            name: "tearDown — destroy widget and clean up DOM",
            runTest: function () {
                if (widget) {
                    widget.destroy();
                    widget = null;
                }
                if (container) {
                    domConstruct.destroy(container);
                    container = null;
                }
                doh.assertTrue(true, "Widget and container cleaned up");
            }
        }
    ]);

    doh.run();
});
