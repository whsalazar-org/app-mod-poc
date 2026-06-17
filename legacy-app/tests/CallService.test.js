/**
 * tests/CallService.test.js — DOH tests for app/services/CallService.js.
 *
 * LEGACY: Dojo DOH test framework; uses dojo/request/registry to mock XHR.
 * TODO: Replace with Jest tests using HttpClientTestingModule.
 *
 * Run with: doh.runner.html?testModule=tests/CallService.test
 *
 * GAPS (intentional — for test-gap-scanner to detect):
 *   1. No error-case tests for answerCall or endCall.
 *   2. No tests for holdCall, getCall, or transferCall.
 *   3. No tests for network timeout or 5xx responses.
 */
require([
    "doh",
    "dojo/Deferred",
    "dojo/request/registry",
    "app/services/CallService",
    "app/services/AuthService"
], function (doh, Deferred, registry, CallService, AuthService) {
    "use strict";

    // ----------------------------------------------------------------
    // Test helpers
    // ----------------------------------------------------------------

    /**
     * Register a one-shot mock response for a given URL pattern.
     *
     * @param {RegExp|string} urlPattern
     * @param {Object}        responseData
     * @param {boolean}       [shouldFail] - If true, the mock rejects.
     */
    function mockRequest(urlPattern, responseData, shouldFail) {
        registry.register(urlPattern, function (url, opts) {
            var d = new Deferred();
            // Simulate async resolution.
            setTimeout(function () {
                if (shouldFail) {
                    d.reject({ status: 500, message: "Server error" });
                } else {
                    d.resolve(responseData);
                }
            }, 0);
            return d.promise;
        });
    }

    // Seed a fake auth token so headers don't fail.
    // LEGACY: Directly manipulating the AuthService singleton — fragile test setup.
    // TODO: Use Angular TestBed with HttpClientTestingModule and stub AuthService.
    AuthService._token   = "test-token-abc";
    AuthService._agentId = "A001";

    // ----------------------------------------------------------------
    // answerCall — happy path only
    // LEGACY: Missing error-case test.
    // ----------------------------------------------------------------
    doh.register("CallService.answerCall", [

        {
            name: "should resolve with server response on success",
            timeout: 3000,
            runTest: function () {
                var deferred = new doh.Deferred();

                // Mock the /api/calls/Q1/answer endpoint.
                mockRequest(/\/api\/calls\/Q1\/answer/, {
                    success:  true,
                    callId:   "Q1",
                    agentId:  "A001"
                });

                CallService.answerCall("Q1").then(
                    function (response) {
                        try {
                            doh.assertTrue(response.success,
                                "Response.success should be true");
                            doh.assertEqual("Q1", response.callId,
                                "Response should include callId");
                            deferred.callback(true);
                        } catch (e) {
                            deferred.errback(e);
                        }
                    },
                    function (err) {
                        deferred.errback(err);
                    }
                );

                return deferred;
            }
        }

        // INTENTIONAL GAP: No error-case test for answerCall.
        // TODO: Add test for answerCall when server returns 500:
        // {
        //     name: "should reject on server error",
        //     runTest: function() { ... mockRequest(..., null, true) ... }
        // }
    ]);

    // ----------------------------------------------------------------
    // endCall — happy path only
    // LEGACY: Missing error-case test.
    // ----------------------------------------------------------------
    doh.register("CallService.endCall", [

        {
            name: "should resolve with server response on success",
            timeout: 3000,
            runTest: function () {
                var deferred = new doh.Deferred();

                // Mock the /api/calls/Q1/end endpoint.
                mockRequest(/\/api\/calls\/Q1\/end/, {
                    success:     true,
                    callId:      "Q1",
                    disposition: "resolved"
                });

                CallService.endCall("Q1", "resolved", "Customer issue resolved.").then(
                    function (response) {
                        try {
                            doh.assertTrue(response.success,
                                "Response.success should be true");
                            doh.assertEqual("resolved", response.disposition,
                                "Response should echo back the disposition");
                            deferred.callback(true);
                        } catch (e) {
                            deferred.errback(e);
                        }
                    },
                    function (err) {
                        deferred.errback(err);
                    }
                );

                return deferred;
            }
        }

        // INTENTIONAL GAP: No error-case test for endCall.
        // TODO: Add:
        //   - Test for endCall when server returns 404 (call not found).
        //   - Test for endCall with an invalid disposition code.
        //   - Test for endCall when the network times out.
    ]);

    // INTENTIONAL GAPS — tests not written for:
    //   - holdCall()
    //   - transferCall() (including the missing error-handling path)
    //   - getCall()
    //
    // These are deliberate gaps for the test-gap-scanner skill.

    doh.run();
});
