import { useSession } from "@tanstack/react-start/server";
import type * as z from "zod";
import type { serializableSignUpSession, signUpSession } from "@/schemas/sign-up-session.schema";

export type SignUpSession = z.infer<typeof signUpSession>;
export type SerializableSignUpSession = z.infer<typeof serializableSignUpSession>;

export function useSignUpSession() {
  return useSession<SerializableSignUpSession>({
    name: "signup-session",
    password: process.env.SESSION_SECRET!,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  });
}
