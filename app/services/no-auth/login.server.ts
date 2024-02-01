// On this file: all queries that don't require authentication

import type { GraphQlResponse } from "~/lib/types/GraphQlResponse"

import { config } from "~/../config"
import { extractAuthToken, extractRefreshToken } from "~/lib/tokenParsers"
import logger from "~/lib/logger.server"

export type LoginPayload = {
  login: FormDataEntryValue | null
  password: FormDataEntryValue | null
}

type Credentials = {
  authToken: string
  refreshToken: string
}

type LoginReturn<T> = {
  result: GraphQlResponse<T>
  credentials?: Credentials
}

const commonFetchOptions: any = {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
}

const gqlFetcher = async <T>(
  gqlQuery: string,
  variables?: object,
): Promise<GraphQlResponse<T>> => {
  const options: any = {
    ...commonFetchOptions,
    body: JSON.stringify({
      query: gqlQuery,
      variables: {
        ...variables,
        // avoid recaptcha implementation for the time being
        recaptchaResponse: "I_NEED_TO_PROPERLY_IMPLEMENT_RECAPTCHA",
      },
    }),
  }

  const response = await fetch(config.nexusGraphqlUrl.href, options)
  if (response) {
    // According to GraphQL specification, no 1xx nor 3xx status codes should be
    // issued. Also `graphql-http`, the library used in Nexus Backend, only
    // has responses with status from 2xx, 4xx and 5xx
    if (response.status >= 200 && response.status < 300) {
      return await response.json()
    } else if (response.status >= 400 && response.status < 500) {
      logger.warn(`${response.status} status produced by query:\n${gqlQuery}`)
      throw new Error(`User error: "${response.statusText}"`)
    } else if (response.status >= 500) {
      logger.error(`${response.status} status produced by query:\n${gqlQuery}`)
      throw new Error(`Backend error: "${response.statusText}"`)
    }
  }

  const noResponseMsg = "No response from Nexus backend"
  logger.error(noResponseMsg)
  throw new Error(noResponseMsg)
}

export const backEndLogin = async <T>(
  payload: LoginPayload,
): Promise<LoginReturn<T>> => {
  const gqlQuery = `
    mutation login (
      $email: String!
      $password: String!
      $recaptchaResponse: String
      ) {
        login(
          email: $email,
          password: $password,
          recaptchaResponse: $recaptchaResponse
        )
    }`

  const options: any = {
    ...commonFetchOptions,
    body: JSON.stringify({
      query: gqlQuery,
      variables: {
        email: payload.login,
        password: payload.password,
        // avoid recaptcha implementation for the time being
        recaptchaResponse: "I_NEED_TO_PROPERLY_IMPLEMENT_RECAPTCHA",
      },
    }),
  }

  // Note: cannot use `gqlFetcher` cause we need access to the Response to fish
  // for auth tokens
  const response = await fetch(config.nexusGraphqlUrl.href, options)
  const result = await response.json()

  if (result.data.login === "ACCEPTED") {
    // get auth tokens
    const authorization = response.headers.get("new-authorization")
    const refreshCookie = response.headers.get("set-cookie")
    if (!authorization || !refreshCookie) {
      const errorMsg =
        "Login accepted but no authorization tokens in response headers"
      logger.error(errorMsg)
      throw new Error(errorMsg)
    }
    const credentials = {
      authToken: extractAuthToken(authorization),
      refreshToken: extractRefreshToken(refreshCookie),
    }

    return { result, credentials }
  }

  return { result }
}

export const requestPasswordReset = async <T>(
  email: string,
): Promise<GraphQlResponse<T>> => {
  const gqlQuery = `
    mutation RequestPasswordReset(
      $email: String!,
      $recaptchaResponse: String!
    ) {
      data: requestPasswordReset(
        email: $email
        recaptchaResponse: $recaptchaResponse
      )
    }
  `

  const result = (<T>await gqlFetcher(gqlQuery, {
    email,
    // avoid recaptcha implementation for the time being
    recaptchaResponse: "I_NEED_TO_PROPERLY_IMPLEMENT_RECAPTCHA",
  })) as GraphQlResponse<T>
  logger.debug({ requestPasswordReset: JSON.stringify(result, null, 2) })
  return result
}

export const resetPassword = async <T>({
  email,
  newPassword,
  resetCode,
}: {
  email: string
  newPassword: string
  resetCode: string
}): Promise<GraphQlResponse<T>> => {
  const gqlQuery = `
    mutation ResetPassword(
      $email: String!,
      $newPassword: String!,
      $code: String!,
      $recaptchaResponse: String
    ) {
      data: resetPassword(
        email: $email
        newPassword: $newPassword,
        code: $code,
        recaptchaResponse: $recaptchaResponse
      )
    }
  `

  const result = (<T>await gqlFetcher(gqlQuery, {
    email,
    newPassword,
    code: resetCode,
    // avoid recaptcha implementation for the time being
    recaptchaResponse: "I_NEED_TO_PROPERLY_IMPLEMENT_RECAPTCHA",
  })) as GraphQlResponse<T>
  logger.debug({ resetPassword: JSON.stringify(result, null, 2) })
  return result
}

export const getPasswordRequirements = async <T>(): Promise<
  GraphQlResponse<T>
> => {
  const gqlQuery = `
    query GetInfo {
      info {
        server {
          passwordValidationRules {
            minLength
            mustHaveUpperCaseLetters
            mustHaveNumbers
            mustHaveSymbols
          }
        }
      }
    }
  `

  const result = (<T>await gqlFetcher(gqlQuery)) as GraphQlResponse<T>
  logger.debug({ getPasswordRequirements: JSON.stringify(result, null, 2) })
  return result
}

export const refreshPassword = async <T>({
  email,
  password,
  newPassword,
}: {
  email: string
  password: string
  newPassword: string
  recaptchaResponse: string
}): Promise<GraphQlResponse<T>> => {
  const gqlQuery = `
    mutation ChangeExpiredPassword(
      $email: String!
      $password: String!
      $newPassword: String!
      $recaptchaResponse: String!
    ) {
      data: changeExpiredPassword(
        email: $email
        password: $password
        newPassword: $newPassword
        recaptchaResponse: $recaptchaResponse
      )
    }
  `

  const result = (<T>await gqlFetcher(gqlQuery, {
    email,
    password,
    newPassword,
  })) as GraphQlResponse<T>
  logger.debug({ refreshPassword: JSON.stringify(result, null, 2) })
  return result
}
