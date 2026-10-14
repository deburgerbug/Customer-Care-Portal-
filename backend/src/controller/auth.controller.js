import * as authService from "../services/auth.service.js";
import {
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
} from "../utils/refreshCookie.js";

export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.validated.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.validated.body);
    const { refreshToken, ...response } = result;
    setRefreshCookie(res, refreshToken);
    res.status(200).json({
      success: true,
      message: "Login successful",
      ...response,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    const tokens = await authService.refreshAccessToken(refreshToken);
    setRefreshCookie(res, tokens.refreshToken);
    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const userId = req.user?.id;
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    await authService.logoutUser(userId, refreshToken);
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.validated.params;
    const { password } = req.validated.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.validated.params;
    const result = await authService.verifyEmail(token);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
