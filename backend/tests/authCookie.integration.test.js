import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/auth-cookie-integration-test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-32-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-32-characters";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";

const [{ default: app }, { default: User }] = await Promise.all([
  import("../src/app.js"),
  import("../src/models/user.schema.js"),
]);

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await User.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

async function createVerifiedUser() {
  return User.create({
    name: "Cookie Test User",
    email: "cookie-test@example.com",
    password: "test-password",
    role: "customer",
    isEmailVerified: true,
    isActive: true,
  });
}

function extractRefreshToken(setCookieHeader) {
  const cookie = setCookieHeader.find((value) => value.startsWith("refreshToken="));
  assert.ok(cookie, "expected a refresh-token cookie");
  return cookie.match(/^refreshToken=([^;]+)/)?.[1];
}

test("login, refresh rotation, and logout use an HttpOnly refresh cookie", async () => {
  await createVerifiedUser();

  const agent = request.agent(app);
  const loginResponse = await agent
    .post("/auth/login")
    .set("Origin", "http://localhost:5173")
    .send({ email: "cookie-test@example.com", password: "test-password" })
    .expect(200);

  assert.ok(loginResponse.body.accessToken);
  assert.equal(loginResponse.body.refreshToken, undefined);
  assert.equal(
    loginResponse.headers["access-control-allow-credentials"],
    "true"
  );

  const loginSetCookie = loginResponse.headers["set-cookie"];
  const initialRefreshToken = extractRefreshToken(loginSetCookie);
  const cookieHeader = loginSetCookie.find((value) => value.startsWith("refreshToken="));
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /SameSite=Lax/i);
  assert.match(cookieHeader, /Path=\/auth/i);

  const refreshResponse = await agent
    .post("/auth/refresh")
    .set("Origin", "http://localhost:5173")
    .expect(200);

  assert.ok(refreshResponse.body.accessToken);
  assert.equal(refreshResponse.body.refreshToken, undefined);
  const rotatedRefreshToken = extractRefreshToken(
    refreshResponse.headers["set-cookie"]
  );
  assert.notEqual(rotatedRefreshToken, initialRefreshToken);

  const logoutResponse = await agent
    .post("/auth/logout")
    .set("Origin", "http://localhost:5173")
    .set("Authorization", `Bearer ${refreshResponse.body.accessToken}`)
    .expect(200);

  assert.equal(logoutResponse.body.message, "Logged out successfully");
  const clearedCookie = logoutResponse.headers["set-cookie"].find((value) =>
    value.startsWith("refreshToken=")
  );
  assert.match(clearedCookie, /Expires=Thu, 01 Jan 1970/i);

  const revokedRefreshResponse = await request(app)
    .post("/auth/refresh")
    .set("Origin", "http://localhost:5173")
    .set("Cookie", `refreshToken=${rotatedRefreshToken}`)
    .expect(401);
  assert.equal(revokedRefreshResponse.body.errorCode, "INVALID_SESSION");

  const savedUser = await User.findOne({ email: "cookie-test@example.com" })
    .select("+refreshTokens");
  assert.equal(savedUser.refreshTokens.length, 0);
});

test("refresh rejects a missing or invalid refresh cookie", async () => {
  const missingCookieResponse = await request(app)
    .post("/auth/refresh")
    .set("Origin", "http://localhost:5173")
    .expect(400);
  assert.equal(missingCookieResponse.body.errorCode, "REFRESH_TOKEN_REQUIRED");

  const invalidCookieResponse = await request(app)
    .post("/auth/refresh")
    .set("Origin", "http://localhost:5173")
    .set("Cookie", "refreshToken=not-a-valid-token")
    .expect(401);
  assert.equal(invalidCookieResponse.body.errorCode, "INVALID_REFRESH_TOKEN");
});

test("cookie-auth endpoints reject unapproved request origins", async () => {
  const response = await request(app)
    .post("/auth/refresh")
    .set("Origin", "https://untrusted.example")
    .expect(403);

  assert.equal(response.body.errorCode, "ORIGIN_NOT_ALLOWED");
});
