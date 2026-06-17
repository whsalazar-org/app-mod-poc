/**
 * app/utils/formatters.js — Display formatting utilities.
 *
 * LEGACY: Pure utility functions using dojo/_base/lang.
 * TODO: Replace with Angular pipes (PhoneNumberPipe, DurationPipe, etc.)
 *       and move to a shared Angular utility library.
 *
 * NOTE: _formatPhone logic is also duplicated in CustomerSearch.js — tech debt.
 */
define([
    "dojo/_base/lang"
], function (lang) {
    "use strict";

    return {

        /**
         * Format a raw 10-digit phone number to (xxx) xxx-xxxx.
         *
         * @param {string} phone - Raw phone number (digits only or with formatting).
         * @returns {string} Formatted phone number, or original if not 10 digits.
         *
         * @example
         *   formatPhoneNumber("5551234567") // "(555) 123-4567"
         */
        formatPhoneNumber: function (phone) {
            if (!phone) { return ""; }
            var digits = String(phone).replace(/\D/g, "");
            if (digits.length === 10) {
                return "(" + digits.substring(0, 3) + ") " +
                       digits.substring(3, 6) + "-" +
                       digits.substring(6);
            }
            if (digits.length === 11 && digits.charAt(0) === "1") {
                return "+1 (" + digits.substring(1, 4) + ") " +
                       digits.substring(4, 7) + "-" +
                       digits.substring(7);
            }
            return phone;
        },

        /**
         * Format a duration in seconds to mm:ss string.
         *
         * @param {number} seconds - Total duration in seconds.
         * @returns {string} Formatted duration (e.g. "04:32").
         *
         * @example
         *   formatDuration(272) // "04:32"
         */
        formatDuration: function (seconds) {
            if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
                return "00:00";
            }
            var mins = Math.floor(seconds / 60);
            var secs = Math.floor(seconds % 60);
            return (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
        },

        /**
         * Format an ISO 8601 timestamp string to a locale-friendly date/time.
         *
         * @param {string} isoString - ISO timestamp (e.g. "2024-01-15T14:30:00Z").
         * @returns {string} Formatted date/time string in the browser's locale.
         *
         * @example
         *   formatTimestamp("2024-01-15T14:30:00Z") // "1/15/2024, 2:30:00 PM"
         */
        formatTimestamp: function (isoString) {
            if (!isoString) { return "—"; }
            try {
                var d = new Date(isoString);
                if (isNaN(d.getTime())) { return isoString; }
                // LEGACY: Using toLocaleString() — output varies by browser/OS locale.
                // TODO: Use Angular DatePipe with a fixed format: {{ ts | date:'short' }}
                return d.toLocaleString();
            } catch (e) {
                return isoString;
            }
        },

        /**
         * Map an internal call status/disposition code to a display label.
         *
         * @param {string} status - Internal status code (e.g. "active", "resolved").
         * @returns {string} Human-readable status label.
         *
         * NOTE: No unit test for this function — intentional gap for test-gap-scanner.
         */
        formatCallStatus: function (status) {
            // LEGACY: Magic strings for status codes — should come from config.
            // TODO: Use an enum or lookup table from shared config in Angular.
            var statusMap = {
                queued:        "Queued",
                ringing:       "Ringing",
                active:        "Active",
                hold:          "On Hold",
                transferred:   "Transferred",
                ended:         "Ended",
                resolved:      "Resolved",
                escalated:     "Escalated",
                callback:      "Callback Scheduled",
                voicemail:     "Voicemail",
                wrong_number:  "Wrong Number",
                abandoned:     "Abandoned"
            };
            return statusMap[status] || (status || "Unknown");
        }
    };
});
