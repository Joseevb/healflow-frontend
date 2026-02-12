import type * as z from "zod";
import type { signUpSchema } from "@/schemas/sing-up.schema";
import type { signInSchema } from "@/schemas/sing-in.schema";
import type { addressSchema, userDataSchema } from "@/schemas/user-data.schema";

export type IsLoading = {
  loading: boolean;
  type?: "google" | "apple" | "email" | string;
};

export type SocialSignOnProvider = {
  name: string;
  imageUrl: string;
  callbackUrl?: string;
  onClick?: () => void;
};

export const signUpState = [
  "email",
  "user-data",
  "payment-info",
  "success",
  "social-sign-on",
  "profile-update",
] as const;

export type SignUpState = (typeof signUpState)[number];

export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;
export type UserDataSchema = z.infer<typeof userDataSchema>;
