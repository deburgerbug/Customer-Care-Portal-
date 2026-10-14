import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { validate } from "../src/middleware/validate.middleware.js";
import { AppError } from "../src/errors/AppError.js";

test("validate stores parsed request values and calls next", () => {
  const req = {
    body: { email: " USER@EXAMPLE.COM " },
  };
  let nextCalled = false;

  validate({ body: z.object({ email: z.string().trim().toLowerCase().email() }) })(
    req,
    {},
    (error) => {
      assert.equal(error, undefined);
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, true);
  assert.deepEqual(req.validated, {
    body: { email: "user@example.com" },
  });
});

test("validate forwards a structured AppError for invalid input", () => {
  const req = { body: { email: "invalid" } };
  let validationError;

  validate({ body: z.object({ email: z.string().email() }) })(req, {}, (error) => {
    validationError = error;
  });

  assert.ok(validationError instanceof AppError);
  assert.equal(validationError.statusCode, 400);
  assert.equal(validationError.errorCode, "VALIDATION_ERROR");
  assert.equal(validationError.details[0].path, "email");
  assert.equal(req.validated, undefined);
});
