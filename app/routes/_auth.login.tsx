import { RiLoginBoxLine, RiErrorWarningLine } from "react-icons/ri"
import { ImSpinner9 } from "react-icons/im"
import { GrStatusGood } from "react-icons/gr"

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"

import {
  Form,
  useNavigation,
  useActionData,
  useSubmit,
  useLoaderData,
  Link,
} from "@remix-run/react"
import { json, redirect } from "@remix-run/node"
import { useTranslation } from "react-i18next"

import { getSession, commitSession } from "~/fileSessions"
import { backEndLogin } from "~/services/no-auth/login.server"
import { htmlClosestParentByTag } from "~/lib/htmlClosestParentByTag"
import { languageCookie } from "~/services/cookie.server"
import { languages } from "~/lib/languages"
import { getBrandingLogo } from "~/services/branding.server"
import { GraphQlError } from "~/lib/types/GraphQlResponse"

export { ErrorBoundary } from "~/components/ErrorBoundary"

// Tell Remix to load these localization namespaces
export const handle = {
  i18n: ["common", "login"],
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie")
  const session = await getSession(cookie)

  if (session.has("credentials")) {
    // we're loged in, redirect as soon as possible
    return redirect("/")
  }

  const languageSetByUser = await languageCookie.parse(cookie)
  const brandingLogo = await getBrandingLogo()
  const { searchParams } = new URL(request.url)
  const passwordReset = searchParams.get("password-reset")

  return json({
    brandingLogo,
    languageSetByUser,
    passwordReset,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("cookie"))
  const formData = await request.formData()
  const btnAction = formData.get("_action")

  if (btnAction === "selectLanguage") {
    const language = formData.get("language") as string
    return json(
      {
        // TODO use getFixedT: got importing problems, so I decided to make this
        // ugly hack, but the component should receive the tranlated message
        // instead of this
        message: "languageChanged",
        target: languages[language],
      },
      {
        headers: {
          "Set-Cookie": await languageCookie.serialize(language),
        },
      },
    )
  }

  const login = formData.get("login")
  const password = formData.get("password")
  if (login === "" || password === "") {
    return json({
      error: "error.emptyLoginOrPassword",
    })
  }

  const possibleResults = [
    // without "ACCEPTED" nor "EXPIRED", those receive a different treatment
    "BLOCKED",
    "DISABLED",
    "REJECTED",
    "UNACCEPTABLE_INTERACTION",
  ]
  const { result, credentials } = await backEndLogin({ login, password })
  if (credentials) {
    session.set("credentials", credentials)
    session.set("user", {
      login: login,
    })

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    })
  } else if (result.data?.login === "EXPIRED") {
    return redirect(`/refresh-password?login=${login}`)
  } else if (result.errors?.length) {
    return json({
      error: result.errors.map((e: GraphQlError) => e.message),
    })
  } else if (possibleResults.includes(result.data.login)) {
    return json({
      error: `error.${result.data.login.toLowerCase()}`,
    })
  }

  // else
  return json({
    error: "error.backendError",
  })
}

const switchLanguage = (event: any) => {
  const detailsNode = htmlClosestParentByTag(event.currentTarget, "details")
  if (detailsNode !== null) {
    detailsNode.removeAttribute("open")
    const summary = detailsNode.getElementsByTagName("summary")
    summary[0].innerHTML = languages[event.currentTarget.value]
  }
}

export default function Login() {
  const navigation = useNavigation()
  const { languageSetByUser, brandingLogo, passwordReset } =
    useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()
  const { t: tc } = useTranslation("common")
  const { t: tl } = useTranslation("login")

  return (
    <div className="flex justify-center items-center pt-8 min-h-screen">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <Form
            method="post"
            onChange={event => {
              submit(event.currentTarget)
            }}>
            <input type="hidden" name="_action" value="selectLanguage" />
            <label className="form-control w-full max-w-xs justify-center">
              <select
                id="language-chooser"
                name="language"
                className="select select-secondary w-full max-w-xs"
                onChange={switchLanguage}
                value={languageSetByUser ? languageSetByUser : "en_US"}>
                <option value="en_US">English</option>
                <option value="es_AR">Español</option>
                <option value="pt_BR">Português</option>
              </select>
              <div className="label">
                <span className="label-text-alt text-align-right"></span>
                <span className="label-text-alt text-align-right text-info">
                  {actionData?.message ?
                    `${tc(actionData.message)} ${actionData.target}`
                  : ""}
                </span>
              </div>
            </label>
          </Form>

          <figure>
            {brandingLogo ?
              <img alt="SMC Logo" src={brandingLogo} width="200" height="70" />
            : <img
                alt="SMC Logo"
                src="/img/logo-smc.png"
                width="200"
                height="70"
              />
            }
          </figure>

          {actionData?.error ?
            <div
              role="alert"
              className="alert alert-error place-content-center">
              <RiErrorWarningLine />
              <span>{tl(actionData.error)}</span>
            </div>
          : null}

          {passwordReset === "true" ?
            <div
              role="alert"
              className="alert alert-success place-content-center">
              <GrStatusGood />
              <span>{tl("resetPassword.success")}</span>
            </div>
          : null}

          <Form method="post">
            <label htmlFor="login" className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">{tl("nameOrEmail")}</span>
              </div>
              <input
                type="text"
                name="login"
                id="login"
                placeholder="pepe@example.com"
                className="input input-bordered w-full max-w-xs"
                autoComplete="username"
                required
              />
            </label>

            <label htmlFor="password" className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">{tl("password")}</span>
              </div>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="HN84nBnOnK198eM"
                className="input input-bordered w-full max-w-xs"
                autoComplete="current-password"
                required
              />
            </label>
            <div className="card-actions justify-center">
              {navigation.state === "submitting" ?
                <button
                  aria-busy="true"
                  className="btn btn-primary btn-wide btn-xs sm:btn-sm md:btn-md lg:btn-lg m-2">
                  {tl("loading")}...
                  <ImSpinner9 />
                </button>
              : <button className="btn btn-primary btn-wide btn-xs sm:btn-sm md:btn-md lg:btn-lg m-2">
                  <span>{tl("login")}</span>
                  <RiLoginBoxLine />
                </button>
              }

              <Link to="/forgot-password" className="text-secondary">
                {tl("forgotPassword.forgot")}
              </Link>
            </div>
          </Form>

          <div className="flex flex-row">
            <div className="basis-1/2">
              <figure>
                <img alt="SMC Logo" src="/img/logo-smc.png" className="h-14" />
              </figure>
            </div>
            <div className="basis-1/2">
              <figure>
                <img
                  alt="Nexus Logo"
                  src="/img/logo-nexus.png"
                  className="h-14"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
