/**
 * app/utils/validators.js — Input validation utilities.
 *
 * LEGACY: Pure functions using basic regex — no Angular Validators integration.
 * TODO: Replace with Angular reactive form validators (Validators.pattern, custom validators).
 */
define([], function () {
    "use strict";

    return {

        /**
         * Validate a US phone number (accepts various formats).
         *
         * @param {string} phone
         * @returns {boolean}
         */
        isValidPhone: function (phone) {
            if (!phone) { return false; }
            var digits = String(phone).replace(/\D/g, "");
            return digits.length === 10 ||
                   (digits.length === 11 && digits.charAt(0) === "1");
        },

        /**
         * Validate an account number (format: ACC-NNNNN).
         *
         * @param {string} accountNumber
         * @returns {boolean}
         */
        isValidAccountNumber: function (accountNumber) {
            if (!accountNumber) { return false; }
            return /^ACC-\d{5}$/.test(accountNumber);
        },

        /**
         * Validate an email address (basic RFC 5322 subset).
         *
         * @param {string} email
         * @returns {boolean}
         */
        isValidEmail: function (email) {
            if (!email) { return false; }
            var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(email);
        },

        /**
         * Check that a required string field is non-empty.
         *
         * @param {string} value
         * @returns {boolean}
         */
        isRequired: function (value) {
            return value !== null && value !== undefined &&
                   String(value).trim().length > 0;
        },

        /**
         * Validate a call disposition code against the allowed list.
         *
         * LEGACY: Hard-coded allowed values — should reference config.dispositions.
         * TODO: Import config and reference config.dispositions in Angular service.
         *
         * @param {string} disposition
         * @returns {boolean}
         */
        isValidDisposition: function (disposition) {
            var allowed = [
                "resolved", "escalated", "callback",
                "voicemail", "wrong_number", "abandoned"
            ];
            return allowed.indexOf(disposition) !== -1;
        }
    };
});
