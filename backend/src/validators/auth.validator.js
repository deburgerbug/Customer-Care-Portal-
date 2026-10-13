import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const tokenSchema = z.string().regex(/^[a-f\d]{64}$/i, "Token format is invalid");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
}).strict();

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
}).strict();

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
}).strict();

export const forgotPasswordSchema = z.object({
  email: emailSchema,
}).strict();

export const resetPasswordSchema = z.object({
  password: passwordSchema,
}).strict();

export const tokenParamsSchema = z.object({
  token: tokenSchema,
}).strict();
