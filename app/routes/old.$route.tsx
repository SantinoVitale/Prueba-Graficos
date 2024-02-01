import type { LoaderFunctionArgs } from "@remix-run/node"

import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"

import { shouldRenewToken } from "~/lib/shouldRenewToken"
import { requireSession } from "~/fileSessions"
import { config } from "~/../config"
import logger from "~/lib/logger.server"
import OldClient from "~/components/oldClient"
import { refreshAuthToken } from "~/services/refreshAuthToken"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.route, "No route for old client")
  const session = await requireSession(request)
  const credentials = session.get("credentials")
  let jwt = credentials.authToken
  if (shouldRenewToken(credentials.authToken)) {
    logger.debug("Refreshing auth token...")
    const token = await refreshAuthToken(request)
    jwt = token
  }

  const url =
    params.route === "controlPanel" ?
      // dashboard (aka controlPanel) in old client goes to `/`
      new URL(config.oldNexusFrontEnd)
    : new URL(params.route, config.oldNexusFrontEnd)

  url.searchParams.set("jwt", jwt)
  return json({
    src: url.toString(),
  })
}

export default function OldClientIframe() {
  const { src } = useLoaderData<typeof loader>()

  return <OldClient src={src} />
}
