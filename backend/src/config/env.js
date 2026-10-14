import "dotenv/config"
import {z} from "zod"
import { logger } from "../utils/logger.js";

const allowedOriginsSchema = z.string()
    .default("http://localhost:5173")
    .transform((value) => value.split(",").map((origin) => origin.trim()))
    .pipe(z.array(
        z.url().refine((origin) => {
            const parsedOrigin = new URL(origin)
            return (
                ["http:", "https:"].includes(parsedOrigin.protocol) &&
                parsedOrigin.pathname === "/" &&
                !parsedOrigin.search &&
                !parsedOrigin.hash
            )
        }, "Each allowed origin must be an HTTP or HTTPS origin without a path")
            .transform((origin) => new URL(origin).origin)
    ).min(1, "At least one allowed origin is required"))

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),

    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    ALLOWED_ORIGINS: allowedOriginsSchema,
    
    EMAIL_USER: z.string().optional(),
    EMAIL_PASS: z.string().optional()
})

const result = envSchema.safeParse(process.env)

if(!result.success){
    const missing = result.error.issues
    .map((issue) => issue.path.join() || "env")
    .join(", ")

    logger.fatal(
        { fieldErrors: result.error.flatten().fieldErrors },
        "Invalid environment configuration"
    );
    throw new Error(`Missing or invalid environment variables: ${missing}`)
}

export const env = result.data;

export const allowedOrigin = env.ALLOWED_ORIGINS
