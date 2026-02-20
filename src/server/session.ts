import { useSession } from "@tanstack/react-start/server";
import { serializableSignUpSession } from "@/schemas/sign-up-session.schema";
import type { SerializableSignUpSession } from "@/schemas/sign-up-session.schema";
import { createServerFn } from "@tanstack/react-start";

// Helper to get session instance (internal use only)
function getSession() {
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

// Get session data (serializable)
export const getSignUpSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  return session.data;
});

// Update session data
export const updateSignUpSession = createServerFn({ method: "POST" })
  .inputValidator(serializableSignUpSession)
  .handler(async ({ data }) => {
    const session = await getSession();
    await session.update(data);
    return { success: true };
  });

// Clear session
export const clearSignUpSession = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSession();
  await session.clear();
  return { success: true };
});
