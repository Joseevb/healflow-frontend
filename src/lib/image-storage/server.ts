import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { storage } from "@/lib/image-storage";

export const getSignedImageUrl = createServerFn({ method: "GET" })
  .inputValidator((input: { path: string; expiresIn?: number }) => input)
  .handler(async ({ data }) => {
    if (!storage.getSignedUrl) {
      // Return public URL for local storage
      return `${process.env.LOCAL_PUBLIC_URL}/${data.path}`;
    }

    const program = storage.getSignedUrl(
      `${process.env.S3_PUBLIC_URL}/${data.path}`,
      data.expiresIn ?? 3600,
    );

    return Effect.runPromise(program);
  });
