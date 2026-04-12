/**
 * Zod validation schemas for forms and API responses
 */

import { z } from "zod";

// API Key validation
export const apiKeySchema = z
  .string()
  .min(1, "API key is required")
  .max(256, "API key is too long");

// 2FA code validation (6 digits)
export const otpSchema = z
  .string()
  .length(6, "Code must be 6 digits")
  .regex(/^\d{6}$/, "Code must be 6 digits");

// TOTP secret validation - Base32 format (case insensitive)
export const totpSecretSchema = z
  .string()
  .min(1, "TOTP secret is required")
  .regex(/^[A-Za-z2-7]+=*$/, "Invalid TOTP secret format");

// Role validation
export const roleSchema = z.enum(["student", "faculty"]);

// GitHub credentials validation
export const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

// Complete verification form schema
export const verificationFormSchema = z
  .object({
    email: credentialsSchema.shape.email,
    password: credentialsSchema.shape.password,
    role: roleSchema,
    authType: z.enum(["otp", "totp"]),
    otp: z.string().optional(),
    totp_secret: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.authType === "otp") {
        return data.otp && otpSchema.safeParse(data.otp).success;
      }
      return true;
    },
    {
      message: "Please enter a valid 6-digit code",
      path: ["otp"],
    }
  )
  .refine(
    (data) => {
      if (data.authType === "totp") {
        return data.totp_secret && data.totp_secret.length > 0;
      }
      return true;
    },
    {
      message: "TOTP secret is required",
      path: ["totp_secret"],
    }
  );

// API Response schemas
export const creditsResponseSchema = z.object({
  user_id: z.number(),
  api_credits_available: z.number(),
  api_credits_locked: z.number(),
  api_credits_total: z.number(),
  bot_credits_available: z.number(),
  bot_credits_locked: z.number(),
  total_verifications: z.number(),
  referrals: z.number(),
  referral_credits_earned: z.number(),
  joined_at: z.string(),
});

export const jobSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  role: z.string(),
  message: z.string(),
  app_id: z.string().optional(),
  credits_charged: z.number().optional(),
  credits_remaining: z.number().optional(),
  elapsed_seconds: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const jobsResponseSchema = z.object({
  user_id: z.number(),
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
  jobs: z.array(jobSchema),
});

export const verifyResponseSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  message: z.string().optional(),
  api_credits_available: z.number().optional(),
  api_credits_locked: z.number().optional(),
});

// Type inference helpers
export type VerificationFormData = z.infer<typeof verificationFormSchema>;
export type CreditsResponse = z.infer<typeof creditsResponseSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobsResponse = z.infer<typeof jobsResponseSchema>;
export type VerifyResponse = z.infer<typeof verifyResponseSchema>;
