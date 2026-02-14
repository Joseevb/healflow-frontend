import * as z from "zod";

export const addressSchema = z.object({
  street: z.string().nonempty("Street cannot be empty").nonoptional(),
  city: z.string().nonempty("City cannot be empty").nonoptional(),
  state: z.string().nonempty("State cannot be empty").nonoptional(),
  zipCode: z.string().nonempty("Zip code cannot be empty").nonoptional(),
});

export const userDataSchema = z.object({
  phoneNumber: z.string().nonempty("Phone number cannot be empty").nonoptional(),
  dateOfBirth: z.string().nonempty("Date of birth cannot be empty").nonoptional(),
  address: addressSchema,
  primaryCareSpecialist: z
    .uuid()
    .nonempty("Primary care specialist is required")
    .nonoptional("Primary care specialist is required"),
});
