import { Effect } from 'effect'
import { TaggedError } from 'effect/Data'
import type {
  ApiProblemDetail,
  ProvisionUserRequest,
  ValidationProblemDetail,
} from '@/client'
import type { ApiKeyConfig } from '@/lib/api-key.config'
import { provisionUser } from '@/client'

export class UserRegistrationError extends TaggedError(
  'UserRegistrationError',
)<{
  message?: string
}> {}

export class UserRegistrationService {
  #apiKeyConfig: ApiKeyConfig

  constructor(apiKeyConfig: ApiKeyConfig) {
    this.#apiKeyConfig = apiKeyConfig
  }

  post(userData: ProvisionUserRequest) {
    const apiKeyConfig = this.#apiKeyConfig

    return Effect.gen(function* (this: UserRegistrationService) {
      const apiKey = yield* apiKeyConfig.getKey()
      const headerName = yield* apiKeyConfig.getHeaderName()

      const success = yield* Effect.tryPromise({
        try: async () => {
          const res = await provisionUser({
            body: userData,
            headers: {
              [headerName]: apiKey,
            },
          })

          if (res.response.status === 201) {
            return res
          }

          const errorRes = res.error

          let errorMessage = 'Unknown error'
          switch (errorRes?.status) {
            case 400:
              errorMessage = (errorRes as ValidationProblemDetail).detail
                ? `Invalid request: ${JSON.stringify((errorRes as ValidationProblemDetail).detail)}`
                : 'Invalid request'
              break
            case 401:
              errorMessage =
                (errorRes as ApiProblemDetail).detail || 'Unauthorized'
              break
            case 403:
              errorMessage =
                (errorRes as ApiProblemDetail).detail || 'Forbidden'
              break
          }
          throw new Error(errorMessage)
        },
        catch: (err: unknown) => {
          console.log('Provision error', err)
          const message = err instanceof Error ? err.message : String(err)
          return new UserRegistrationError({ message })
        },
      })

      return success
    })
  }
}
