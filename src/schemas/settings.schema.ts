import * as z from "zod";

export const settingsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  dateOfBirth: z.string(),
});
