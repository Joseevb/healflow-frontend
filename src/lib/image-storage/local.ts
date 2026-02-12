import { Effect } from "effect";
import { StorageError } from "./types";
import type { ImageStorage } from "./types";

export interface LocalStorageConfig {
  readonly basePath: string;
  readonly publicUrl: string;
}

export const makeLocalStorage = (config: LocalStorageConfig): ImageStorage => ({
  upload: (file, options) =>
    Effect.gen(function* () {
      const folder = options?.folder ?? "default";
      const dir = `${config.basePath}/${folder}`;

      // Ensure directory exists using Bun
      yield* Effect.tryPromise({
        try: () => Bun.$`mkdir -p ${dir}`.text().then(() => undefined),
        catch: () => new StorageError({ message: `Failed to create directory: ${dir}` }),
      });

      const ext = file.name.split(".").pop();
      const filename = options?.filename ?? `${crypto.randomUUID()}.${ext}`;
      const filepath = `${dir}/${filename}`;

      // Read file using Bun.file()
      const arrayBuffer = yield* Effect.tryPromise({
        try: () => file.arrayBuffer(),
        catch: () => new StorageError({ message: `Failed to read file: ${file.name}` }),
      });

      // Write file using Bun.file() and Bun.write()
      yield* Effect.tryPromise({
        try: async () => {
          const bunFile = Bun.file(filepath);
          await Bun.write(bunFile, arrayBuffer);
        },
        catch: () => new StorageError({ message: `Failed to write file: ${filepath}` }),
      });

      return `${config.publicUrl}/${folder}/${filename}`;
    }),

  delete: (url) => {
    const relativePath = url.replace(config.publicUrl, "");
    const filepath = `${config.basePath}/${relativePath}`;

    return Effect.tryPromise({
      // eslint-disable-next-line drizzle/enforce-delete-with-where
      try: () => Bun.file(filepath).delete(),
      catch: () => new StorageError({ message: `Failed to delete file: ${filepath}` }),
    }).pipe(
      Effect.orElseSucceed(() => undefined), // Succeed even if file didn't exist
    );
  },
});
