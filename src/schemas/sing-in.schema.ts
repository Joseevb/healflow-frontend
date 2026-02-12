import * as z from "zod";

export const signInSchema = z.object({
  email: z
    .email("It must be a valid email")
    .nonempty("Email cannot be empty")
    .nonoptional("Email is required"),
  password: z.string().nonempty("Password cannot be empty").nonoptional("Password is required"),
  rememberMe: z.boolean(),
});
