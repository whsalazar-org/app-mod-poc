/**
 * tests/formatters.test.js — Unit tests for app/utils/formatters.js.
 *
 * LEGACY: Dojo DOH test framework.
 * TODO: Replace with Jest unit tests.
 *
 * Run with: doh.runner.html?testModule=tests/formatters.test
 *
 * NOTE: Tests for formatCallStatus are intentionally missing.
 *       This is a gap for the test-gap-scanner skill to detect.
 */
require([
    "doh",
    "app/utils/formatters"
], function (doh, formatters) {
    "use strict";

    // ----------------------------------------------------------------
    // formatPhoneNumber
    // ----------------------------------------------------------------
    doh.register("formatters.formatPhoneNumber", [

        {
            name: "should format 10-digit number to (xxx) xxx-xxxx",
            runTest: function () {
                var result = formatters.formatPhoneNumber("5551234567");
                doh.assertEqual("(555) 123-4567", result,
                    "Expected formatted phone number");
            }
        },

        {
            name: "should strip non-digit characters before formatting",
            runTest: function () {
                var result = formatters.formatPhoneNumber("555-123-4567");
                doh.assertEqual("(555) 123-4567", result,
                    "Should strip dashes and format");
            }
        },

        {
            name: "should handle 11-digit number with leading 1",
            runTest: function () {
                var result = formatters.formatPhoneNumber("15551234567");
                doh.assertEqual("+1 (555) 123-4567", result,
                    "Should format as international");
            }
        },

        {
            name: "should return empty string for null input",
            runTest: function () {
                var result = formatters.formatPhoneNumber(null);
                doh.assertEqual("", result, "null should return empty string");
            }
        },

        {
            name: "should return original string for non-10-digit input",
            runTest: function () {
                var result = formatters.formatPhoneNumber("12345");
                doh.assertEqual("12345", result,
                    "Short numbers should be returned as-is");
            }
        },

        {
            name: "should return empty string for empty input",
            runTest: function () {
                var result = formatters.formatPhoneNumber("");
                doh.assertEqual("", result, "Empty string should return empty string");
            }
        }
    ]);

    // ----------------------------------------------------------------
    // formatDuration
    // ----------------------------------------------------------------
    doh.register("formatters.formatDuration", [

        {
            name: "should format 0 seconds as 00:00",
            runTest: function () {
                var result = formatters.formatDuration(0);
                doh.assertEqual("00:00", result, "0 seconds should be 00:00");
            }
        },

        {
            name: "should format 65 seconds as 01:05",
            runTest: function () {
                var result = formatters.formatDuration(65);
                doh.assertEqual("01:05", result, "65 seconds should be 01:05");
            }
        },

        {
            name: "should format 3600 seconds as 60:00",
            runTest: function () {
                var result = formatters.formatDuration(3600);
                doh.assertEqual("60:00", result, "3600 seconds should be 60:00");
            }
        },

        {
            name: "should format 272 seconds as 04:32",
            runTest: function () {
                var result = formatters.formatDuration(272);
                doh.assertEqual("04:32", result, "272 seconds should be 04:32");
            }
        },

        {
            name: "should return 00:00 for negative input",
            runTest: function () {
                var result = formatters.formatDuration(-10);
                doh.assertEqual("00:00", result, "Negative should return 00:00");
            }
        },

        {
            name: "should return 00:00 for NaN input",
            runTest: function () {
                var result = formatters.formatDuration(NaN);
                doh.assertEqual("00:00", result, "NaN should return 00:00");
            }
        }
    ]);

    // ----------------------------------------------------------------
    // formatTimestamp
    // ----------------------------------------------------------------
    doh.register("formatters.formatTimestamp", [

        {
            name: "should return dash for null input",
            runTest: function () {
                var result = formatters.formatTimestamp(null);
                doh.assertEqual("\u2014", result, "null should return em-dash");
            }
        },

        {
            name: "should return dash for empty string",
            runTest: function () {
                var result = formatters.formatTimestamp("");
                doh.assertEqual("\u2014", result, "Empty string should return em-dash");
            }
        },

        {
            name: "should return a non-empty string for a valid ISO timestamp",
            runTest: function () {
                var result = formatters.formatTimestamp("2024-01-15T14:30:00Z");
                doh.assertTrue(result.length > 0,
                    "Valid ISO timestamp should return a non-empty string; got: " + result);
                doh.assertNotEqual("\u2014", result,
                    "Valid timestamp should not return em-dash");
            }
        },

        {
            name: "should return the original string for an invalid date",
            runTest: function () {
                var input  = "not-a-date";
                var result = formatters.formatTimestamp(input);
                doh.assertEqual(input, result,
                    "Invalid date string should be returned as-is");
            }
        }
    ]);

    // ----------------------------------------------------------------
    // formatCallStatus — INTENTIONALLY NOT TESTED
    // ----------------------------------------------------------------
    // NOTE: Tests for formatCallStatus() are missing here.
    // This is a deliberate gap — the test-gap-scanner skill should flag
    // that formatCallStatus has no test coverage in this suite.
    //
    // TODO: Add tests for:
    //   - Known status codes ("queued", "active", "resolved", etc.)
    //   - Unknown status codes (should return the raw code or "Unknown")
    //   - null/undefined input

    doh.run();
});
