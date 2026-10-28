import { test } from "node:test";
import assert from "node:assert/strict";
import { initialBetaAccess, canChangeAdmin } from "./beta-policy.ts";

test("first sign-up is not automatically admin, even with an approved request", () => {
  assert.deepEqual(initialBetaAccess("first@example.com", "owner@example.com", "approved"),
    { role: "tester", status: "approved" });
  assert.deepEqual(initialBetaAccess("first@example.com", undefined, undefined),
    { role: "tester", status: "pending" });
  assert.deepEqual(initialBetaAccess("owner@example.com", "owner@example.com", "rejected"),
    { role: "admin", status: "approved" });
});

test("self-revocation and last-admin revocation are refused", () => {
  assert.equal(canChangeAdmin("a", "a", "admin", "approved", "tester", "approved", 2), false);
  assert.equal(canChangeAdmin("a", "a", "admin", "approved", "admin", "suspended", 2), false);
  assert.equal(canChangeAdmin("a", "b", "admin", "approved", "tester", "approved", 1), false);
  assert.equal(canChangeAdmin("a", "b", "admin", "approved", "tester", "approved", 2), true);
});