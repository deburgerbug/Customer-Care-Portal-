import test from "node:test";
import assert from "node:assert/strict";
import {
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
} from "../src/utils/refreshCookie.js";

test("refresh cookie is HttpOnly and scoped to authentication routes", () => {
  let cookie;
  const res = {
    cookie(name, value, options) {
      cookie = { name, value, options };
    },
  };

  setRefreshCookie(res, "refresh-token-value");

  assert.equal(cookie.name, REFRESH_COOKIE_NAME);
  assert.equal(cookie.value, "refresh-token-value");
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, "lax");
  assert.equal(cookie.options.path, "/auth");
  assert.equal(cookie.options.maxAge, 7 * 24 * 60 * 60 * 1000);
});

test("refresh cookie is cleared using matching cookie attributes", () => {
  let clearedCookie;
  const res = {
    clearCookie(name, options) {
      clearedCookie = { name, options };
    },
  };

  clearRefreshCookie(res);

  assert.equal(clearedCookie.name, REFRESH_COOKIE_NAME);
  assert.equal(clearedCookie.options.httpOnly, true);
  assert.equal(clearedCookie.options.sameSite, "lax");
  assert.equal(clearedCookie.options.path, "/auth");
});
