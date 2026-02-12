import { Context, Data } from "effect";
import type { Effect } from "effect";

export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class StorageError extends Data.TaggedError("StorageError")<{ message?: string }> {}

export interface ImageStorage {
  readonly upload: (file: File, options?: UploadOptions) => Effect.Effect<string, StorageError>;

  readonly delete: (url: string) => Effect.Effect<void, StorageError>;

  readonly getSignedUrl?: (url: string, expiresIn?: number) => Effect.Effect<string, StorageError>;
}

// Context tag for DI
export class ImageStorageLayer extends Context.Tag("ImageStorageLayer")<
  ImageStorageLayer,
  ImageStorage
>() {}
