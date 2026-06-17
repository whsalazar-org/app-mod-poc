/**
 * app/nls/callcenter.js — i18n root bundle (English strings).
 *
 * LEGACY: Dojo i18n bundle format (root object + locale flags).
 * TODO: Replace with Angular i18n (ngx-translate or Angular built-in i18n).
 *
 * Usage (LEGACY):
 *   define(["dojo/i18n!app/nls/callcenter"], function(i18n) {
 *       console.log(i18n.title); // "CallCenter Pro"
 *   });
 */
define({
    root: {
        // Application
        title: "CallCenter Pro",
        loading: "Loading\u2026",

        // Agent panel
        agentPanel_title:      "My Status",
        agentPanel_callsToday: "Calls Today",
        agentPanel_avgHandle:  "Avg Handle Time",

        // Call queue
        queue_title:        "Call Queue",
        queue_empty:        "No calls in queue",
        queue_colCaller:    "Caller",
        queue_colPhone:     "Phone",
        queue_colSkill:     "Skill",
        queue_colAction:    "Action",
        queue_btnAnswer:    "Answer",
        queue_btnRefresh:   "Refresh",

        // Active call
        activeCall_title:        "Active Call",
        activeCall_idle:         "No active call. Answer a call from the queue to begin.",
        activeCall_caller:       "Caller",
        activeCall_callId:       "Call ID",
        activeCall_status:       "Status",
        activeCall_customerInfo: "Customer Info",
        activeCall_lookingUp:    "Looking up customer\u2026",
        activeCall_noCustomer:   "No customer record found",
        activeCall_btnHold:      "Hold",
        activeCall_btnTransfer:  "Transfer",
        activeCall_btnEnd:       "End Call",
        activeCall_disposition:  "Disposition",
        activeCall_notes:        "Notes",
        activeCall_notesHint:    "Enter call notes\u2026",

        // Customer search
        search_title:       "Customer Search",
        search_placeholder: "Name, phone or account#",
        search_noResults:   "No customers found.",

        // Call history
        history_title:   "Call History",
        history_empty:   "Select a customer to view call history.",
        history_noRecs:  "No call history for this customer.",
        history_colDate:  "Date/Time",
        history_colDur:   "Duration",
        history_colAgent: "Agent",
        history_colDisp:  "Disposition",
        history_colNotes: "Notes",
        history_prevPage: "\u00ab Prev",
        history_nextPage: "Next \u00bb",

        // Transfer dialog
        transfer_title:       "Transfer Call",
        transfer_selectAgent: "Transfer To Agent",
        transfer_notes:       "Transfer Notes",
        transfer_notesHint:   "Transfer reason / notes for receiving agent\u2026",
        transfer_noAgents:    "No agents available",
        transfer_btnCancel:   "Cancel",
        transfer_btnConfirm:  "Transfer Call",

        // Dispositions
        disp_resolved:      "Resolved",
        disp_escalated:     "Escalated",
        disp_callback:      "Callback Scheduled",
        disp_voicemail:     "Left Voicemail",
        disp_wrong_number:  "Wrong Number",
        disp_abandoned:     "Abandoned",

        // Agent statuses
        status_available:   "Available",
        status_busy:        "Busy",
        status_break:       "On Break",
        status_training:    "Training",
        status_unavailable: "Unavailable",

        // Errors / notifications
        error_loginFailed:   "Login failed. Please check your credentials.",
        error_callEnd:       "Failed to end call. Please try again.",
        error_critical:      "A critical error occurred: ",
        notify_welcome:      "Welcome back!",
        notify_onHold:       "Call placed on hold.",
        notify_transferred:  "Call transferred successfully.",
        notify_noDisposition: "Please select a call disposition before ending the call.",

        // Login form
        login_title:       "CallCenter Pro",
        login_username:    "Username",
        login_password:    "Password",
        login_btnLogin:    "Login",
        login_errorInvalid: "Invalid credentials."
    },

    // Locale flags — "true" means a translation bundle exists for this locale.
    "es": true
});
