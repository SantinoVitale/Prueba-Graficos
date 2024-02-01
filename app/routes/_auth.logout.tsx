import type { ActionFunctionArgs } from "@remix-run/node"

import { redirect } from "@remix-run/node"

import { destroySession, getSession } from "~/fileSessions"

export const loader = async () => {
  return redirect("/login")
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("cookie"))
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  })
}
