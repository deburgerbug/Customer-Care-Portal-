import test from "node:test";
import assert from "node:assert/strict";
import { allowedOrigin } from "../src/config/env.js";
import { AppError } from "../src/errors/AppError.js";
import { requireAllowedOrigin } from "../src/middleware/requireAllowedOrigin.middleware.js";

test("origin guard permits configured origins and requests without Origin", () => {
  for (const origin of [allowedOrigin[0], undefined]) {
    let nextCalled = false;
    const req = {
      get: () => origin,
    };

    requireAllowedOrigin(req, {}, (error) => {
      assert.equal(error, undefined);
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  }
});

test("origin guard rejects unconfigured browser origins", () => {
  let nextError;
  const req = {
    get: () => "https://untrusted.example",
  };

  requireAllowedOrigin(req, {}, (error) => {
    nextError = error;
  });

  assert.ok(nextError instanceof AppError);
  assert.equal(nextError.statusCode, 403);
  assert.equal(nextError.errorCode, "ORIGIN_NOT_ALLOWED");
});
