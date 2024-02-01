import { env } from "node:process"
import { URL, fileURLToPath } from "node:url"
import { dirname } from "node:path"

if (!env.COOKIE_SECRET) {
  throw new Error("Please set 'COOKIE_SECRET' environment variable")
}

if (!env.COOKIE_SESSION_NAME) {
  throw new Error("Please set 'COOKIE_SESSION_NAME' environment variable")
}

if (!env.NEXUS_BACKEND_URL) {
  throw new Error("Please set 'NEXUS_BACKEND_URL' environment variable")
}

if (!env.OLD_NEXUX_CLIENT_URL) {
  throw new Error("Please set 'OLD_NEXUX_CLIENT_URL' environment variable")
}

const isProdEnv = env.NODE_ENV === "production"
const isDevEnv = !isProdEnv

export const config = {
  rootPath: dirname(fileURLToPath(import.meta.url)),
  port: env.PORT || 4000,
  cookie: {
    secret: env.COOKIE_SECRET,
    name: env.COOKIE_SESSION_NAME,
  },
  nexusBackendUrl: new URL(env.NEXUS_BACKEND_URL),
  nexusGraphqlUrl: new URL("/graphql", env.NEXUS_BACKEND_URL),
  oldNexusFrontEnd: new URL(env.OLD_NEXUX_CLIENT_URL),

  logLevel: env.NEXUS_LOG_LEVEL || "info",

  // convenience values
  isProdEnv,
  isDevEnv,
}
