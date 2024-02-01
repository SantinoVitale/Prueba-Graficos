import { RiErrorWarningLine } from "react-icons/ri"
import mainStyles from "~/styles/main.css"
import { cssBundleHref } from "@remix-run/css-bundle"

import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"

import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react"
import { useChangeLanguage } from "remix-i18next"
import { useTranslation } from "react-i18next"
import { config } from "~/../config"
import { getSession } from "~/fileSessions"
import { languages } from "~/lib/languages"
import { getUserInfo, setNewLanguage } from "~/services/user.server"
import i18next from "~/services/i18next.server"
import { languageCookie } from "~/services/cookie.server"
import SideNav from "~/components/sidenav"
import { getCurrentCommit } from "~/services/version.server"
import { buildAvatarString } from "~/services/buildAvatarString.server"

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: mainStyles },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const browserLocale = await i18next.getLocale(request)
  const version = await getCurrentCommit()
  const session = await getSession(request.headers.get("cookie"))
  const credentials = session.get("credentials")
  if (credentials) {
    const profileWithJwt = `profile?jwt=${credentials.authToken ?? "profile"}`
    // TODO check for Graphql errors
    const { data: userData } = await getUserInfo(request)
    const { user } = userData
    const avatarString =
      user.name ?
        buildAvatarString(user.name, "name")
      : buildAvatarString(user.email, "email")

    console.log(avatarString)
    return json({
      version,
      browserLocale: null,
      user: {
        name: user.name as string,
        email: user.email as string,
        avatarString,
        group: user.tenant.name as string,
        profileUrl: new URL(profileWithJwt, config.oldNexusFrontEnd).toString(),
        locale: user.locale as string,
      },
    })
  }

  return json({
    version,
    browserLocale,
    user: null,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const btnAction = formData.get("_action")
  if (btnAction === "selectLanguage") {
    const language = formData.get("language") as string
    await setNewLanguage(request, language)
    return json(
      {
        message: `Language changed to ${languages[language]}`,
      },
      {
        headers: {
          "Set-Cookie": await languageCookie.serialize(language),
        },
      },
    )
  }
}

export default function App() {
  const { browserLocale, user, version } = useLoaderData<typeof loader>()
  const { i18n } = useTranslation()

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  const locale = user?.locale ? user.locale : (browserLocale as string)
  useChangeLanguage(locale)

  return (
    <html lang={locale} dir={i18n.dir()} className={user ? "" : "bg-sky-600"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {user ?
          <SideNav user={user} version={version} />
        : <main
            id="main"
            className="flex justify-center items-center min-h-screen">
            <Outlet />
          </main>
        }

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(">>>", error)
  return (
    <html lang="en_US">
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="card w-auto bg-neutral text-error-content">
          <div className="card-body">
            {isRouteErrorResponse(error) ?
              <>
                <h2 className="card-title text-yellow-200">
                  {error.status} {error.statusText}
                </h2>
                <div role="alert" className="alert alert-error">
                  <RiErrorWarningLine />
                  <p>{error.data}</p>
                </div>
              </>
            : error instanceof Error ?
              <>
                <h2 className="card-title text-yellow-200">Error</h2>
                <div role="alert" className="alert alert-error">
                  <RiErrorWarningLine />
                  <p>{error.message}</p>
                </div>
                <h3 className="text-yellow-200">The stack trace is:</h3>
                <p className="text-white">{error.stack}</p>
              </>
            : typeof error === "string" ?
              <>
                <h2 className="card-title text-yellow-200">Error</h2>
                <div role="alert" className="alert alert-error">
                  <RiErrorWarningLine />
                  <p>{error}</p>
                </div>
              </>
            : <>
                <h2 className="card-title text-yellow-200">Unknown Error</h2>
                <div role="alert" className="alert alert-error">
                  <RiErrorWarningLine />
                  <p>{JSON.stringify(error)}</p>
                </div>
              </>
            }
          </div>
        </div>

        <Scripts />
      </body>
    </html>
  )
}
