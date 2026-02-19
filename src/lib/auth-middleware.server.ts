import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getSession } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import { attempt } from "@/lib/attempt";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();

  const { data: sessionRes, error: sessionErr } = await attempt(() =>
    getSession({
      fetchOptions: {
        headers: headers,
      },
    }),
  );
  const session = sessionErr ? null : sessionRes.data;

  const { data: jwtRes, error: jwtErr } = await attempt(() =>
    auth.api.getToken({ headers: headers }),
  );
  const jwt = jwtErr ? null : jwtRes.token || null;

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }
    : {
        id: undefined,
        name: undefined,
        image: undefined,
      };

  return await next({
    context: {
      user,
      jwt: session ? jwt : null,
    },
  });
});
