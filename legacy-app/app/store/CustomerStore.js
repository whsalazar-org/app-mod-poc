/**
 * app/store/CustomerStore.js — Customer record store backed by localStorage.
 *
 * LEGACY: dojo/store/Memory seeded from localStorage.
 * TODO: Replace with NgRx entity store; use HttpClient to load from server.
 */
define([
    "dojo/store/Memory",
    "dojo/_base/lang"
], function (Memory, lang) {
    "use strict";

    var STORAGE_KEY = "callcenter_customers";

    /**
     * Load customers from localStorage (legacy persistence mechanism).
     * LEGACY: localStorage used as a database — not suitable for production.
     * TODO: Replace with server-side persistence via REST API.
     */
    function loadFromStorage() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("[CustomerStore] Failed to load from localStorage:", e);
            return [];
        }
    }

    /**
     * Persist the current store contents to localStorage.
     */
    function saveToStorage(store) {
        try {
            var allRecords = [];
            store.query({}).forEach(function (item) {
                allRecords.push(item);
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
        } catch (e) {
            console.error("[CustomerStore] Failed to save to localStorage:", e);
        }
    }

    // Seed data for demo purposes.
    var seedData = [
        {
            customerId:  "C001",
            firstName:   "Alice",
            lastName:    "Thompson",
            phone:       "5551234567",
            email:       "alice.thompson@example.com",
            accountNumber: "ACC-10001",
            tier:        "gold"
        },
        {
            customerId:  "C002",
            firstName:   "Bob",
            lastName:    "Martinez",
            phone:       "5559876543",
            email:       "bob.martinez@example.com",
            accountNumber: "ACC-10002",
            tier:        "standard"
        },
        {
            customerId:  "C003",
            firstName:   "Carol",
            lastName:    "Johnson",
            phone:       "5555551234",
            email:       "carol.j@example.com",
            accountNumber: "ACC-10003",
            tier:        "premium"
        }
    ];

    var initialData = loadFromStorage();
    if (initialData.length === 0) {
        initialData = seedData;
    }

    var store = new Memory({
        idProperty: "customerId",
        data: initialData
    });

    // Monkey-patch put/add/remove to auto-persist.
    // LEGACY: Monkey-patching store methods — brittle pattern.
    var originalPut = lang.hitch(store, store.put);
    store.put = function (item, options) {
        var result = originalPut(item, options);
        saveToStorage(this);
        return result;
    };

    var originalAdd = lang.hitch(store, store.add);
    store.add = function (item, options) {
        var result = originalAdd(item, options);
        saveToStorage(this);
        return result;
    };

    /**
     * Search customers by partial name, phone, or account number.
     * LEGACY: In-memory linear search — O(n).
     * TODO: Replace with server-side search endpoint.
     */
    store.search = function (query) {
        var q = (query || "").toLowerCase();
        var results = [];
        this.query({}).forEach(function (customer) {
            var fullName = (customer.firstName + " " + customer.lastName).toLowerCase();
            var phone    = (customer.phone || "").replace(/\D/g, "");
            var account  = (customer.accountNumber || "").toLowerCase();
            if (fullName.indexOf(q) !== -1 ||
                phone.indexOf(q)    !== -1 ||
                account.indexOf(q)  !== -1) {
                results.push(customer);
            }
        });
        return results;
    };

    return store;
});
