import {
  RiHome4Line,
  RiDeviceLine,
  RiSoundModuleLine,
  RiDashboard2Line,
  RiFileChartLine,
  RiToolsLine,
} from "react-icons/ri"

import { LiaFileInvoiceDollarSolid } from "react-icons/lia"
import { PiUsersThree } from "react-icons/pi"
import { HiOutlineRectangleGroup } from "react-icons/hi2"
import { FaClipboardUser } from "react-icons/fa6"
import { LuFileKey2 } from "react-icons/lu"
import { MdOutlineSettingsInputAntenna } from "react-icons/md"

import { NavLink, Outlet } from "@remix-run/react"
import { useTranslation } from "react-i18next"

import Header from "~/components/header"

export default function SideNav({
  user,
  version,
}: {
  user?: { [index: string]: string }
  version?: string
}) {
  const { t: tc } = useTranslation("common")
  const { t: ts } = useTranslation("sidenav")

  let isSidebarExpanded = true
  const toggleSideBar = () => {
    isSidebarExpanded = !isSidebarExpanded
    const sidenav = document.getElementById("sidenav")
    const sidenavButton = document.getElementById("sidenav-button")
    const navItems: HTMLCollectionOf<Element> =
      document.getElementsByClassName("nav-item")

    isSidebarExpanded ?
      sidenav?.classList.add("w-auto")
    : sidenav?.classList.remove("w-auto")

    if (sidenavButton) {
      isSidebarExpanded ?
        (sidenavButton.innerText = "←")
      : (sidenavButton.innerText = "…")
    }

    for (const element of navItems) {
      isSidebarExpanded ?
        element.classList.remove("hidden")
      : element.classList.add("hidden")
    }
  }

  return (
    <div className={`drawer ${isSidebarExpanded ? "drawer-open" : ""}`}>
      <input id="sidenav-toggler" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content m-3">
        <Header user={user} />
        <Outlet />
      </div>

      <div className="drawer-side">
        <label
          htmlFor="sidenav"
          aria-label="close sidebar"
          className="drawer-overlay"></label>
        <aside
          id="sidenav"
          className={`menu p-4 min-h-full bg-base-200 text-base-content ${
            isSidebarExpanded ? "w-auto" : ""
          }`}>
          <div className="flex justify-end">
            <button
              id="sidenav-button"
              className="btn btn-ghost btn-square"
              onClick={toggleSideBar}>
              {isSidebarExpanded ? "←" : "…"}
            </button>
          </div>

          <strong className="nav-item">{tc("newClient")}</strong>
          <ul className="menu bg-base-200 rounded-r-box">
            <li>
              <NavLink to="/servicePoints">
                <RiHome4Line />
                <span className="nav-item">{ts("servicePoints")}</span>
              </NavLink>
            </li>
          </ul>

          <details role="list">
            <summary aria-haspopup="listbox">
              <span className="nav-item">{ts("settings")}</span>
              <RiToolsLine className="inline ml-1" />
            </summary>
            <ul role="listbox">
              <li>
                <NavLink to="/roles" id="roles">
                  <FaClipboardUser />
                  <span className="nav-item">{ts("roles")}</span>
                </NavLink>
              </li>
            </ul>
          </details>
          <hr />

          <strong className="nav-item">{tc("oldClient")}</strong>
          <ul className="menu bg-base-200 rounded-r-box">
            <li>
              <NavLink to="/old/servicePoints" id="servicePoints">
                <RiHome4Line />
                <span className="nav-item">{ts("servicePoints")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/devices" id="devices">
                <RiDeviceLine />
                <span className="nav-item">{ts("devices")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/billings" id="billings">
                <LiaFileInvoiceDollarSolid />
                <span className="nav-item">{ts("billings")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/users" id="users">
                <PiUsersThree />
                <span className="nav-item">{ts("users")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/groups" id="groups">
                <HiOutlineRectangleGroup />
                <span className="nav-item">{ts("groups")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/controlPanel" id="controlPanel">
                <RiSoundModuleLine />
                <span className="nav-item">{ts("controlPanel")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/telemetryDashboards" id="telemetryDashboards">
                <RiDashboard2Line />
                <span className="nav-item">{ts("telemetryDashboard")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/old/usageReports" id="usageReports">
                <RiFileChartLine />
                <span className="nav-item">{ts("usageReports")}</span>
              </NavLink>
            </li>
          </ul>

          <details role="list">
            <summary aria-haspopup="listbox">
              <span className="nav-item">{ts("settings")}</span>
              <RiToolsLine className="inline ml-1" />
            </summary>
            <ul role="listbox">
              <li>
                <NavLink to="/old/roles" id="roles">
                  <FaClipboardUser />
                  <span className="nav-item">{ts("roles")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/old/bandsMappings" id="bandsMappings">
                  <MdOutlineSettingsInputAntenna />
                  <span className="nav-item">{ts("bandsMappings")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/old/apiKeys" id="apiKeys">
                  <LuFileKey2 />
                  <span className="nav-item">{ts("apiKeys")}</span>
                </NavLink>
              </li>
            </ul>
          </details>

          <p className="nav-item text-xs text-right mt-10">
            <strong>Version: {version}</strong>
          </p>
        </aside>
      </div>
    </div>
  )
}
