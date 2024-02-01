import { RiLogoutBoxRLine } from "react-icons/ri"

import { useTranslation } from "react-i18next"
import { useSubmit, Link, Form } from "@remix-run/react"

import Alerts from "./alerts"

export default function Header({
  user,
}: {
  user?: { [index: string]: string }
}) {
  const { t: tc } = useTranslation("common")
  const submit = useSubmit()

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <Link to="/">
          <img alt="SMC Logo" src="/img/logo-smc.png" width="200" height="70" />
        </Link>
      </div>

      {user ?
        <div className="navbar-center m-1">
          <Form
            method="post"
            onChange={event => {
              submit(event.currentTarget)
            }}>
            <input type="hidden" name="_action" value="selectLanguage" />

            <label className="form-control w-full max-w-xs">
              <select
                id="language-chooser"
                name="language"
                className="select select-secondary w-full max-w-xs"
                defaultValue={user.locale ? user.locale : "en_US"}>
                <option value="en_US">English</option>
                <option value="es_AR">Español</option>
                <option value="pt_BR">Português</option>
              </select>
            </label>
          </Form>
        </div>
      : null}

      {user ?
        <div className="navbar-end">
          <Alerts />
          <div className="dropdown dropdown-end">
            <div className="flex">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost avatar placeholder bg-neutral text-neutral-content rounded-xl w-15 ml-1">
                <span>{user.avatarString}</span>
              </div>

              <div className="ml-1 text-xs text-center">
                <strong>{user.name}</strong>
                <br />
                <span className="text-slate-500">[{user.group}]</span>
              </div>
            </div>

            <ul className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <Link to="/old/profile" id="profile">
                  {tc("profile")}
                </Link>
              </li>

              <li>
                <Form method="post" action="/logout">
                  <button className="btn btn-error">
                    <span>{tc("logout")}</span>
                    <RiLogoutBoxRLine />
                  </button>
                </Form>
              </li>
            </ul>
          </div>
        </div>
      : null}
    </div>
  )
}
