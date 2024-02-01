import type { Session } from "@remix-run/node"

import {
  createCookie,
  createFileSessionStorage,
  redirect,
} from "@remix-run/node"

import { config } from "~/../config"
import logger from "~/lib/logger.server"

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secrets: [config.cookie.secret],
  secure: true,
}

const sessionCookie = createCookie(config.cookie.name, cookieOptions)

const { getSession, commitSession, destroySession } = createFileSessionStorage({
  dir: "sessions",
  cookie: sessionCookie,
})

export { getSession, commitSession, destroySession }

export const requireSession = async (request: Request): Promise<Session> => {
  const cookie = request.headers.get("cookie")
  if (!cookie) {
    logger.info("No cookie found on request headers, redirecting to login")
    throw redirect("/login")
  }
  const session = await getSession(cookie)

  if (!session.has("credentials")) {
    logger.info("No auth session, redirecting to login")
    throw redirect("/login")
  }

  return session
}
