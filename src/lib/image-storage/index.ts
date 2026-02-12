// src/lib/storage/index.ts
import { Effect } from "effect";
import { makeStorageLayer } from "./layer";
import { ImageStorageLayer } from "./types";
import type { ImageStorage } from "./types";

const env = process.env;

export const StorageLive = makeStorageLayer(
  env.STORAGE_PROVIDER! === "s3"
    ? {
        provider: "s3",
        s3: {
          region: env.S3_REGION!,
          bucket: env.S3_BUCKET!,
          accessKeyId: env.S3_ACCESS_KEY_ID!,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
          endpoint: env.S3_ENDPOINT!,
          publicUrl: env.S3_PUBLIC_URL!,
        },
      }
    : {
        provider: "local",
        local: {
          basePath: env.LOCAL_STORAGE_PATH!,
          publicUrl: env.LOCAL_PUBLIC_URL!,
        },
      },
);

export const storage: ImageStorage = Effect.runSync(
  Effect.gen(function* () {
    return yield* ImageStorageLayer;
  }).pipe(Effect.provide(StorageLive)),
);

export { ImageStorageLayer };
