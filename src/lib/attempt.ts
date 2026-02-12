export type OperationSuccess<T> = { readonly data: T; readonly error: null };
export type OperationFailure<TError> = {
  readonly data: null;
  readonly error: TError;
};
export type OperationResult<T, TError> = OperationSuccess<T> | OperationFailure<TError>;

type Operation<T> = Promise<T> | (() => T) | (() => Promise<T>);

export function attempt<T, TError = Error>(
  operation: Promise<T>,
): Promise<OperationResult<T, TError>>;
export function attempt<TError = Error>(operation: () => never): OperationResult<never, TError>;
export function attempt<T, TError = Error>(
  operation: () => Promise<T>,
): Promise<OperationResult<T, TError>>;
export function attempt<T, TError = Error>(operation: () => T): OperationResult<T, TError>;
export function attempt<T, TError = Error>(
  operation: Operation<T>,
): OperationResult<T, TError> | Promise<OperationResult<T, TError>> {
  try {
    const result = typeof operation === "function" ? operation() : operation;

    if (isPromise(result)) {
      return Promise.resolve(result)
        .then((data) => onSuccess(data))
        .catch((error) => onFailure<TError>(error));
    }

    return onSuccess(result);
  } catch (error) {
    return onFailure<TError>(error);
  }
}

const onSuccess = <T>(value: T): OperationSuccess<T> => {
  return { data: value, error: null };
};

const onFailure = <TError>(error: unknown): OperationFailure<TError> => {
  const errorParsed = error instanceof Error ? error : new Error(String(error));
  return { data: null, error: errorParsed as TError };
};

const isPromise = <T = unknown>(value: unknown): value is Promise<T> => {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as Promise<T>).then === "function"
  );
};
