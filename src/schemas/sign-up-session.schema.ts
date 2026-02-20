import * as z from "zod";
import { signUpBaseSchema } from "@/schemas/sing-up.schema";
import { userDataSchema } from "@/schemas/user-data.schema";
import { signUpState } from "@/types/auth";

// Create a lenient version of signUpBaseSchema for session validation
// that allows empty firstName and lastName (for social sign-on)
const signUpBaseSchemaLenient = signUpBaseSchema.extend({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
});

export const signUpSession = z.object({
  accountData: signUpBaseSchemaLenient
    .partial({ password: true, confirmPassword: true })
    .extend({
      profileImageRef: z.string().optional(),
    })
    .optional(),
  socialSignOnData: z.any().optional(),
  userData: userDataSchema.optional(),
  state: z.enum(signUpState).optional(),
  createdUserId: z.string().optional(),
  isPaymentSuccessfull: z.boolean().optional(),
});

export const serializableSignUpSession = z.object({
  accountData: signUpBaseSchemaLenient
    .omit({ profileImage: true })
    .partial({ password: true, confirmPassword: true })
    .extend({
      profileImageRef: z.string().optional(),
    })
    .optional(),
  socialSignOnData: z.any().optional(),
  userData: userDataSchema.optional(),
  state: z.enum(signUpState).optional(),
  createdUserId: z.string().optional(),
  isPaymentSuccessfull: z.boolean().optional(),
});

export type SerializableSignUpSession = z.infer<typeof serializableSignUpSession>;
