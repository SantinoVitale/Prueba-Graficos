import { RiErrorWarningLine } from "react-icons/ri"
import { ImSpinner9 } from "react-icons/im"
import { MdEmail } from "react-icons/md"
import { GrStatusGood } from "react-icons/gr"

import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"

import { json, redirect } from "@remix-run/node"
import {
  Form,
  useNavigation,
  useActionData,
  useSubmit,
  useLoaderData,
  Link,
} from "@remix-run/react"
import { useTranslation } from "react-i18next"

import { languageCookie } from "~/services/cookie.server"
import { languages } from "~/lib/languages"
import { getSession } from "~/fileSessions"
import { htmlClosestParentByTag } from "~/lib/htmlClosestParentByTag"
import { getBrandingLogo } from "~/services/branding.server"
import { requestPasswordReset } from "~/services/no-auth/login.server"

// Tell Remix to load these localization namespaces
export const handle = {
  i18n: ["common", "login"],
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("cookie"))
  const languageSetByUser = await languageCookie.parse(
    request.headers.get("cookie"),
  )
  const brandingLogo = await getBrandingLogo()

  if (session.has("credentials")) {
    // we're loged in
    return redirect("/")
  }

  return json({
    brandingLogo,
    languageSetByUser,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
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

  const email = formData.get("email") as string
  if (email === "" || email === null) {
    return json({
      error: "error.emptyEmail",
    })
  }

  const result = await requestPasswordReset(email)
  if (result.data.data === "ACCEPTED") {
    return json({
      success: "forgotPassword.mailSent",
    })
  }

  return json({
    error: `error.${result.data.data.toLowerCase()}`,
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

export default function ForgotPassword() {
  const navigation = useNavigation()
  const { languageSetByUser, brandingLogo } = useLoaderData<typeof loader>()
  const ad = useActionData<typeof action>()
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
                  {ad?.message ? `${tc(ad.message)} ${ad.target}` : ""}
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

          <h1 className="text-center font-extrabold text-blue-600">
            {tl("forgotPassword.recoverPassword")}
          </h1>
          <p>{tl("forgotPassword.help")}</p>

          <div>
            {ad?.error ?
              <div
                role="alert"
                className="alert alert-error place-content-center">
                <RiErrorWarningLine />
                <span>{tl(ad.error)}</span>
              </div>
            : null}
          </div>

          <div>
            {ad?.success ?
              <div
                role="alert"
                className="alert alert-success place-content-center">
                <GrStatusGood />
                <span>{tl(ad.success)}</span>
              </div>
            : null}
          </div>

          <Form method="post">
            <label htmlFor="email" className="form-control w-full max-w-xs">
              <div className="label">
                <div className="flex items-center">
                  <MdEmail className="h-6 w-6 mr-1" />
                  <span className="label-text items-center">Email</span>
                </div>
              </div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="pepe@example.com"
                className="input input-bordered w-full max-w-xs"
                autoComplete="email"
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
                  <span>{tl("forgotPassword.sendEmail")}</span>
                </button>
              }

              <Link to="/login" className="text-secondary">
                {tl("back")}
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
