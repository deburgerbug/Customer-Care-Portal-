# Project Work Report

This report explains the recent backend and frontend work in plain language: what changed, why it changed, and what remains to be done.

## At a glance

The project has been made safer and more consistent in how it handles user input, errors, browser sessions, and logs. Automated checks were added so key validation and cookie behavior can be verified without manually clicking through the website.

The most recent major change moves refresh tokens out of browser storage and into an `HttpOnly` cookie. The browser sends this cookie when needed, but frontend JavaScript cannot read it.

## What changed

### 1. Backend input validation tests

The backend previously had no useful `npm test` command. It now uses Node.js's built-in test runner, so no extra test-runner dependency was needed.

Tests cover:

- Login and registration input, including rejecting a client attempt to choose an account role.
- Customer data cleanup and rules, such as email normalization and requiring primary contact details.
- Department, ticket, and employee input.
- The shared middleware that checks incoming requests.
- Refresh-cookie settings and rejection of requests from unapproved website origins.

**Why this matters:** Changes to validation rules are less likely to accidentally break existing behavior.

### 2. Authentication API uses the shared frontend API client

The frontend's login and other authentication requests now use the same request helper as the rest of the application.

**Why this matters:** Authentication calls follow the same URL, request, and session-handling rules as other API calls instead of maintaining a separate networking pattern.

### 3. Refresh tokens moved to an HttpOnly cookie

The refresh token is the longer-lived credential used to obtain a new access token after the short-lived one expires.

The updated flow is:

1. **Login:** The backend returns the user and short-lived access token. It places the refresh token in a seven-day `HttpOnly` cookie instead of returning that token in the response.
2. **Normal API requests:** The frontend keeps the access token in memory and sends it in the authorization header. It does not store either token in `localStorage`.
3. **Page reload:** The frontend asks the backend to refresh the session. The browser sends the cookie, and the backend returns a new access token.
4. **Access-token expiry:** The shared API client attempts one refresh and retries the failed request. Concurrent refresh attempts in the same page are shared; supported browsers also serialize refreshes across tabs.
5. **Logout:** The backend revokes the current refresh token and clears the cookie.

The cookie is `HttpOnly`, uses `SameSite=Lax`, is limited to `/auth`, and is marked `Secure` in production.

The browser still stores the non-secret user profile for display. That profile is not an authentication token.

### 4. Cookie and cross-origin request setup

- Added cookie parsing so backend routes can read the refresh cookie.
- Enabled credentialed CORS requests for configured frontend origins.
- Added an origin check on login, refresh, and logout to reject requests from unapproved browser origins.
- Removed the refresh-token request-body validation because refresh and logout now get that credential from the cookie.

**Why this matters:** Browsers attach cookies automatically, so the backend must explicitly limit which website origins may use the cookie-based authentication endpoints.

### 5. Existing security and logging improvements

The project also has these earlier completed improvements:

- Helmet adds common protective HTTP response headers.
- Authentication endpoints have request limits to slow repeated login, registration, and password-recovery attempts.
- Pino writes structured logs, including request IDs and response status information.
- Environment variables and API inputs are validated centrally.
- Backend errors use consistent application error responses.

## Verification performed

- Backend test suite: **11 tests passed**.
- Frontend lint: passed.
- Frontend production build: passed.
- Checked cookie-auth behavior for CORS preflight, blocked origins, missing/invalid refresh cookies, and request credentials.
- Confirmed frontend code no longer reads or writes access or refresh tokens in `localStorage`.

The frontend build reports a large JavaScript bundle warning. The build still succeeds; bundle splitting was not part of this work.

## Not included

- Ticket comments remain embedded in ticket records; moving them to a separate collection and adding paginated comment loading was deferred.
- A full login → refresh → logout test against a running database and browser was not completed. Please exercise that flow in the website, especially after a page reload.
- Existing users may need to sign in again after deployment because their old refresh tokens were held in browser storage and are not automatically converted into cookies.
- The ticket index and validation-test changes visible in the commit were already in the worktree when the cookie work was done; they were not part of the cookie-flow design itself.

## Git status and next steps

The work was committed locally as:

```text
1b38a0b Move refresh tokens to HttpOnly cookies
```

The push was rejected because the remote `dev` branch had newer commits. After fetching, the local `dev` branch was one commit ahead and five commits behind `origin/dev`. The commit is still local; it has not yet been pushed.

Before pushing, synchronize `dev` with the remote and resolve any conflicts if Git reports them:

```bash
git switch dev
git pull --rebase origin dev
git push origin dev
```

Then create the usual pull request from `dev` into `main`. Do not push `main` for this change.
