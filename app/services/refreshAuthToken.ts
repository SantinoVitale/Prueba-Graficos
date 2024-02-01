import { getSession } from "~/fileSessions"
import { getGqlFetcher } from "~/services/fetchers.server"

export const refreshAuthToken = async (request: Request): Promise<string> => {
  // minimal info request to produce a token refresh if needed
  const gqlInfo = `
    query {
      info {
        server {
          serverVersion

        }
      }
    }
  `

  // this call will automatically refresh tokens on session
  const gqlFetch = await getGqlFetcher(request)
  // we don't care about the result
  await gqlFetch(gqlInfo)
  const session = await getSession(request.headers.get("cookie"))
  const credentials = session.get("credentials")
  return credentials.authToken
}
