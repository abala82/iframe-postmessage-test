/**
 * hpfParent-sim.js
 *
 * Simulates Chase's hpfParent.min.js bridge script.
 *
 * In production this script is loaded from:
 *   https://chase-var.hostedpaymentservice.net/includes/hpfParent.min.js  (non-prod)
 *   https://chase.hostedpaymentservice.net/includes/hpfParent.min.js      (prod)
 *
 * How it works:
 *   1. Loaded by the VF page (parent of the Chase iframe).
 *   2. Listens for postMessage events from the Chase iframe using a
 *      Chase-specific envelope ({ __chaseHpf: true, type, payload }).
 *   3. Calls the corresponding named function registered on the VF window
 *      (window.completePayment, window.handleTransactionErrors, etc.).
 *   4. This lets the Chase iframe (on a different origin) trigger callbacks
 *      on the VF page without violating the same-origin policy.
 *
 * The VF page registers the callbacks BEFORE this script runs:
 *   window.completePayment         = function(data) { ... }
 *   window.handleTransactionErrors = function(errorFields) { ... }
 *   window.clearErrors             = function() { ... }
 *   window.cancelPayment           = function() { ... }
 */
(function () {
    'use strict';

    window.addEventListener('message', function (event) {
        var data = event.data;

        // Only handle Chase HPF bridge messages
        if (!data || data.__chaseHpf !== true) return;

        switch (data.type) {
            case 'completePayment':
                if (typeof window.completePayment === 'function') {
                    window.completePayment(data.payload);
                }
                break;

            case 'handleTransactionErrors':
                if (typeof window.handleTransactionErrors === 'function') {
                    window.handleTransactionErrors(data.payload);
                }
                break;

            case 'clearErrors':
                if (typeof window.clearErrors === 'function') {
                    window.clearErrors();
                }
                break;

            case 'cancelPayment':
                if (typeof window.cancelPayment === 'function') {
                    window.cancelPayment();
                }
                break;

            default:
                break;
        }
    });

    // Signal to the page that the bridge is ready
    window.dispatchEvent(new Event('hpfParentReady'));
}());
