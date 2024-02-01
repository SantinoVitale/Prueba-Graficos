import { config } from "~/../config"
import { commitSession, getSession } from "~/fileSessions"
import { extractAuthToken, extractRefreshToken } from "~/lib/tokenParsers"
import logger from "~/lib/logger.server"
import { GraphQlResponse } from "~/lib/types/GraphQlResponse"

// returns a function like: gqlFetch(gqlString, [{variables}])
// that can do authenticated fetches and collects new tokens
export const getGqlFetcher = async (
  request: Request,
): Promise<
  <T>(gqlString: string, variables?: object) => Promise<GraphQlResponse<T>>
> => {
  const cookie = request.headers.get("cookie")
  if (!cookie) {
    const msg = "No cookie found on request headers"
    logger.error(msg)
    throw new Error(msg)
  }
  const session = await getSession(cookie)
  const credentials = session.get("credentials")

  const options: any = {
    method: "post",
  }
  if (credentials?.authToken.length) {
    options.headers = {
      "Content-Type": "application/json",
      authorization: `Bearer ${credentials.authToken}`,
      cookie: `refresh-jwt=${credentials.refreshToken}`,
    }
  }

  // gqlFetch
  return async <T>(
    gqlString: string,
    variables?: object,
  ): Promise<GraphQlResponse<T>> => {
    options.body = JSON.stringify({
      query: gqlString,
      variables,
    })
    const response = await fetch(config.nexusGraphqlUrl.href, options)
    if (response) {
      // TODO? should I manage 1xx and 3xx responses?

      if (response.status >= 200 && response.status < 300) {
        // try to refresh tokens if backend sent new
        const newAuthToken = response.headers.get("new-authorization")
        const newRefreshToken = response.headers.get("set-cookie")

        // No tokens refreshed, just continue
        if (newAuthToken === null || newRefreshToken === null) {
          logger.debug("Keep using same auth tokens")
          return await response.json()
        }

        session.set("credentials", {
          authToken: extractAuthToken(newAuthToken),
          refreshToken: extractRefreshToken(newRefreshToken),
        })
        await commitSession(session)
        logger.info("Tokens refreshed")
        return await response.json()
      } else if (response.status >= 400 && response.status < 500) {
        throw new Error(`User error, backend replied: "${response.statusText}"`)
      } else if (response.status >= 500) {
        throw new Error(`Backend error: "${response.statusText}"`)
      }
    }

    throw new Error("No response from Nexus backend")
  }
}
