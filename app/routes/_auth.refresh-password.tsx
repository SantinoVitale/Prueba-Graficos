import {
  RiErrorWarningLine,
  RiLockPasswordFill,
  RiInformationLine,
} from "react-icons/ri"
import { ImSpinner9 } from "react-icons/im"

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  Form,
  useNavigation,
  useLoaderData,
  useActionData,
} from "@remix-run/react"
import { json, redirect } from "@remix-run/node"
import invariant from "tiny-invariant"
import { useTranslation } from "react-i18next"

import { getSession } from "~/fileSessions"
import { getBrandingLogo } from "~/services/branding.server"
import {
  getPasswordRequirements,
  refreshPassword,
} from "~/services/no-auth/login.server"
import { isValidPassword } from "~/lib/passwordValidation"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url)
  const login = searchParams.get("login")

  const session = await getSession(request.headers.get("cookie"))
  if (session.has("credentials")) {
    // we're loged in
    return redirect("/")
  }

  const brandingLogo = await getBrandingLogo()

  const passwordRules = await getPasswordRequirements()
  if (passwordRules.errors?.length) {
    throw new Error(passwordRules.errors.join(" "))
  }

  invariant(
    passwordRules.data?.info.server.passwordValidationRules,
    "No rules received",
  )
  const rules = passwordRules.data?.info.server.passwordValidationRules

  return json({
    brandingLogo,
    login,
    rules,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const login = formData.get("login") as string
  const oldPassword = formData.get("old-password") as string
  const passOne = formData.get("password-one") as string
  const passTwo = formData.get("password-two") as string
  invariant(login, "No login provided by form")
  invariant(oldPassword, "Old password not provided")
  invariant(passOne, "New password not provided")
  invariant(passTwo, "New password repetition not provided")

  if (passOne !== passTwo) {
    return json({
      error: `error.passwordsMustMatch`,
    } as const)
  }

  const passwordRules = await getPasswordRequirements()
  if (passwordRules.errors?.length) {
    // TODO these possible errors should be shown via toast, not ErrorBoundary
    // graphql errors, let the ErrorBoundary deal with them
    throw new Error(passwordRules.errors.join(" "))
  }

  invariant(
    passwordRules.data?.info.server.passwordValidationRules,
    "No rules received",
  )

  const rules = passwordRules.data?.info.server.passwordValidationRules
  if (!isValidPassword(passOne, rules)) {
    return json({
      tsDiscriminator: "error",
      error: `error.invalidPassword`,
    } as const)
  }

  const result = await refreshPassword({
    email: login,
    password: oldPassword,
    newPassword: passOne,
  })
  if (result.errors?.length) {
    // TODO these possible errors should be shown via toast, not ErrorBoundary
    throw new Error(result.errors.join(" "))
  }

  const resultCode = result.data.data
  if (resultCode === "ACCEPTED") {
    return redirect("/login?password-reset=true")
  }

  const possibleErrorResponses = [
    "UNACCEPTABLE_INTERACTION",
    "UNACCEPTABLE_PASSWORD",
    "REJECTED",
    "DISABLED",
    "INVALID",
    "BLOCKED",
  ]

  if (possibleErrorResponses.includes(resultCode)) {
    return json({
      tsDiscriminator: "error",
      error: `error.${resultCode.toLowerCase()}`,
    })
  }

  const errorMsg = "Unexpected response code from backend"
  console.error(errorMsg, JSON.stringify(result, null, 2))
  throw new Error(errorMsg)
}

export default function RefreshPassword() {
  const navigation = useNavigation()
  const { brandingLogo, login, rules } = useLoaderData<typeof loader>()
  invariant(login, "We should have email or name in form")
  const ad = useActionData<typeof action>()
  const { t: tl } = useTranslation("login")

  return (
    <div className="flex justify-center items-center pt-8 min-h-screen">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
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
            {tl("resetPassword.title")}
          </h1>
          <div className="flex flex-row">
            {tl("resetPassword.help")}
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-circle btn-ghost btn-xs text-info ml-8">
                <RiInformationLine className="h-6 w-6 stroke-current" />
              </div>
              <div className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-info text-info-content">
                <div className="card-body">
                  <h3 className="card-title">
                    {tl("resetPassword.passwordRules")}
                  </h3>
                  <ul className="list-disc">
                    {rules.minLength ?
                      <li>{`${tl("resetPassword.validationRules.min")}: ${
                        rules.minLength
                      }`}</li>
                    : null}
                    {rules.mustHaveUpperCaseLetters ?
                      <li>{tl("resetPassword.validationRules.uppercase")}</li>
                    : null}
                    {rules.mustHaveNumbers ?
                      <li>{tl("resetPassword.validationRules.numbers")}</li>
                    : null}
                    {rules.mustHaveSymbols ?
                      <li>{tl("resetPassword.validationRules.symbols")}</li>
                    : null}
                  </ul>
                </div>
              </div>
            </div>
          </div>

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

          <Form method="post">
            <input type="hidden" name="login" value={login} />

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <div className="flex flex-row">
                  <RiLockPasswordFill className="h-6 w-6 mr-1" />
                  <span className="label-text">
                    {tl("refreshPassword.current")}
                  </span>
                </div>
              </div>
              <input
                type="password"
                name="old-password"
                id="old-password"
                className="input input-bordered w-full max-w-xs"
                autoComplete="current-password"
                required
              />
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <div className="flex flex-row">
                  <RiLockPasswordFill className="h-6 w-6 mr-1" />
                  <span className="label-text">{tl("resetPassword.new")}</span>
                </div>
              </div>
              <input
                type="password"
                name="password-one"
                id="password-one"
                className="input input-bordered w-full max-w-xs"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="form-control w-full max-w-xs mt-3">
              <div className="label">
                <div className="flex items-center">
                  <RiLockPasswordFill className="h-6 w-6 mr-1" />
                  <span className="label-text items-center">
                    {tl("resetPassword.repeat")}
                  </span>
                </div>
              </div>
              <input
                type="password"
                name="password-two"
                id="password-two"
                className="input input-bordered w-full max-w-xs"
                autoComplete="new-password"
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
                  <span>{tl("resetPassword.change")}</span>
                </button>
              }
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
