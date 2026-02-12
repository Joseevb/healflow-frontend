// src/lib/storage/layer.ts
import { Layer } from "effect";
import { ImageStorageLayer } from "./types";
import { makeLocalStorage } from "./local";
// import { makeS3Storage } from "./s3";
import type { ImageStorage } from "./types";

export interface StorageConfig {
  readonly provider: "local" | "s3";
  readonly local?: {
    readonly basePath: string;
    readonly publicUrl: string;
  };
  readonly s3?: {
    readonly region: string;
    readonly bucket: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly endpoint?: string;
    readonly publicUrl?: string;
  };
}

export const makeStorageLayer = (config: StorageConfig): Layer.Layer<ImageStorageLayer> => {
  const storage: ImageStorage = makeLocalStorage(config.local!);
  // config.provider === "s3" ? makeS3Storage(config.s3!) : makeLocalStorage(config.local!);

  return Layer.succeed(ImageStorageLayer, storage);
};
