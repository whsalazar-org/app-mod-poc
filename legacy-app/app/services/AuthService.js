/**
 * app/services/AuthService.js — Authentication and session management.
 *
 * LEGACY: Session token stored in dojo/cookie; singleton via module variable.
 * TODO: Replace with Angular AuthService using HttpClient + localStorage/sessionStorage;
 *       protect routes with Angular Guards.
 *
 * KNOWN ISSUES:
 *   1. LEGACY: Singleton pattern via module-level _instance variable.
 *      The entire module is effectively a singleton — state is shared globally.
 *      TODO: Use Angular's providedIn: 'root' singleton service with proper DI.
 *
 *   2. LEGACY: dojo/cookie for token storage — no HttpOnly or Secure flag awareness.
 *      TODO: Use Angular HttpInterceptor + secure cookie or memory-based token.
 *
 *   3. Legacy artifact comment below referencing dojo._base.connect (deprecated).
 */
define([
    "dojo/cookie",
    "dojo/request",
    "dojo/_base/lang",
    "dojo/topic",
    "app/config"
], function (cookie, request, lang, topic, config) {
    "use strict";

    // LEGACY: Module-level singleton state — not injectable, not testable.
    // Old pattern (kept as reference):
    //   dojo._base.connect.connect(window, "onbeforeunload", null, function() { AuthService.logout(); });
    //   ^ dojo._base.connect is deprecated; dojo/on or native addEventListener should be used.
    // TODO: Remove singleton; use Angular DI with AuthService as a providedIn: 'root' service.
    var _token     = null;
    var _agentId   = null;
    var _agentData = null;

    var COOKIE_NAME    = "cc_session_token";
    var AGENT_ID_COOKIE = "cc_agent_id";

    /**
     * Initialise from existing cookies on module load.
     * LEGACY: Cookie-based session restore on page load.
     */
    function _init() {
        _token   = cookie(COOKIE_NAME)    || null;
        _agentId = cookie(AGENT_ID_COOKIE) || null;
    }

    _init();

    var AuthService = {

        /**
         * Check if the user has a valid session token.
         * LEGACY: Token presence == authenticated; no expiry check.
         * TODO: Validate JWT expiry using angular-jwt or a custom pipe.
         *
         * @returns {boolean}
         */
        isAuthenticated: function () {
            return !!_token;
        },

        /**
         * Get the stored bearer token.
         * @returns {string|null}
         */
        getToken: function () {
            return _token;
        },

        /**
         * Get the currently logged-in agent's ID.
         * @returns {string|null}
         */
        getCurrentAgentId: function () {
            return _agentId;
        },

        /**
         * Attempt login with username and password.
         * LEGACY: Returns dojo/Deferred (not a native Promise or Observable).
         * TODO: Return Observable<AuthResponse> from Angular AuthService.
         *
         * @param {string} username
         * @param {string} password
         * @returns {dojo/promise/Promise}
         */
        login: function (username, password) {
            return request.post(config.apiBaseUrl + "/auth/login", {
                data: JSON.stringify({ username: username, password: password }),
                handleAs: "json",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(
                function (response) {
                    _token   = response.token;
                    _agentId = response.agentId;

                    // Store in cookies.
                    // LEGACY: Plain cookie storage — no HttpOnly or Secure attributes set here.
                    cookie(COOKIE_NAME,    _token,   { expires: 1 });
                    cookie(AGENT_ID_COOKIE, _agentId, { expires: 1 });

                    topic.publish("callcenter/notification", {
                        message: "Welcome back!",
                        level:   "success"
                    });

                    return response;
                },
                function (err) {
                    console.error("[AuthService] login failed:", err);
                    topic.publish("callcenter/error", {
                        message: "Login failed. Please check your credentials.",
                        error:   err
                    });
                    throw err;
                }
            );
        },

        /**
         * Log out the current user.
         * LEGACY: Clears cookies and reloads the page (browser-level session end).
         * TODO: Use Angular Router to navigate to /login; invalidate server session.
         *
         * @returns {dojo/promise/Promise}
         */
        logout: function () {
            return request.post(config.apiBaseUrl + "/auth/logout", {
                handleAs: "json",
                headers: {
                    "Authorization": "Bearer " + (_token || "")
                }
            }).then(
                function () {
                    _token     = null;
                    _agentId   = null;
                    _agentData = null;
                    cookie(COOKIE_NAME,    null, { expires: -1 });
                    cookie(AGENT_ID_COOKIE, null, { expires: -1 });

                    // LEGACY: Hard page reload to clear state.
                    // TODO: Use Angular Router.navigate(['/login']) and reset NgRx store.
                    window.location.reload();
                },
                function (err) {
                    console.error("[AuthService] logout failed:", err);
                    // Force logout anyway.
                    window.location.reload();
                }
            );
        },

        /**
         * Show a basic login form in the given container node.
         * LEGACY: Manual DOM construction for a login form — no routing.
         * TODO: Use Angular Router guard to redirect to /login route.
         *
         * @param {HTMLElement} container
         */
        showLoginForm: function (container) {
            container.innerHTML =
                '<div style="max-width:320px; margin:80px auto; padding:32px; ' +
                'background:#fff; border:1px solid #ddd; border-radius:6px; text-align:center;">' +
                '<h2 style="margin-top:0; color:#1a3a5c;">CallCenter Pro</h2>' +
                '<div style="margin-bottom:12px;">' +
                '<input id="cc-username" type="text" placeholder="Username" ' +
                'style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:3px;"/>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<input id="cc-password" type="password" placeholder="Password" ' +
                'style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:3px;"/>' +
                '</div>' +
                '<button id="cc-login-btn" style="width:100%; padding:10px; background:#1a3a5c; ' +
                'color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:14px;">Login</button>' +
                '<div id="cc-login-error" style="color:#f44336; margin-top:8px; font-size:12px;"></div>' +
                '</div>';

            var btn = document.getElementById("cc-login-btn");
            if (btn) {
                btn.onclick = function () {
                    var username = document.getElementById("cc-username").value;
                    var password = document.getElementById("cc-password").value;
                    AuthService.login(username, password).then(
                        function () { window.location.reload(); },
                        function () {
                            var errEl = document.getElementById("cc-login-error");
                            if (errEl) { errEl.innerHTML = "Invalid credentials."; }
                        }
                    );
                };
            }
        }
    };

    return AuthService;
});
