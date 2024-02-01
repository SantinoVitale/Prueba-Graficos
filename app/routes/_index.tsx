import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"

import { redirect } from "@remix-run/node"

import { requireSession } from "~/fileSessions"
import { getInitialRedirection } from "~/lib/initialRedirection"
import { languageCookie } from "~/services/cookie.server"
import { getPerms, getUserInfo, setNewLanguage } from "~/services/user.server"

export const meta: MetaFunction = () => {
  return [
    { title: "SMC Energy - Nexus" },
    { name: "description", content: "Nexus Telemetry System" },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request)

  const languageSetByUser = await languageCookie.parse(
    request.headers.get("cookie"),
  )

  const { data } = await getUserInfo(request)
  if (languageSetByUser && languageSetByUser !== data.user.locale) {
    await setNewLanguage(request, languageSetByUser)
  }

  const perms = await getPerms(request)
  const initialRedirection = getInitialRedirection(perms)

  if (initialRedirection) {
    return redirect(initialRedirection)
  }

  return true
}

export default function Index() {
  return (
    <>
      <h1>Third Nexus Client</h1>
    </>
  )
}
