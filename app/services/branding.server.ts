import { config } from "~/../config"
import logger from "~/lib/logger.server"

export const getBrandingLogo = async (): Promise<any> => {
  const gqlGetBranding = `
    query GetBranding {
      info {
        server {
          branding {
            logotype
          }
        }
      }
    }
  `

  const options: any = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: gqlGetBranding,
    }),
  }

  const response = await fetch(config.nexusGraphqlUrl.href, options)
  const result = await response.json()
  if (result.errors) {
    logger.error("graphql errors:\n", JSON.stringify(result.errors, null, 2))
  }

  return result.data.info.server.branding.logotype
}
