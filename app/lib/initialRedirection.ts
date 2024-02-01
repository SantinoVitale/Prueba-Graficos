import { getPermsCheckers } from "~/lib/permCheckers"
import { topRoutes } from "~/lib/routes"
import logger from "~/lib/logger.server"

export const getInitialRedirection = (permissions: string[]) => {
  // Returns the first route to which the user has access according to
  // `permissions`
  // Used to redirect users after they log in
  const { hasExactPerms, hasAnyPerm } = getPermsCheckers(permissions)

  if (hasExactPerms(["SERVICE_POINT_READ"])) {
    return topRoutes.servicePoints
  } else if (hasExactPerms(["DEVICE_READ"])) {
    return topRoutes.devices
  } else if (hasExactPerms(["BILLING_READ"])) {
    return topRoutes.billings
  } else if (hasExactPerms(["USER_READ"])) {
    return topRoutes.users
  } else if (hasExactPerms(["GROUP_READ"])) {
    return topRoutes.groups
  } else if (hasAnyPerm(["DEVICE_READ", "SYSTEM_ADMIN"])) {
    // TODO on old client they put the dashboard in the root. Change to
    // dashboard once view gets migrated
    // return topRoutes.dashboard;
    return ""
  } else if (
    hasAnyPerm([
      "TELEMETRY_DASHBOARD_CLASS_A_READ",
      "TELEMETRY_DASHBOARD_CLASS_B_READ",
      "TELEMETRY_DASHBOARD_CLASS_C_READ",
      "TELEMETRY_DASHBOARD_CLASS_D_READ",
    ])
  ) {
    return topRoutes.telemetryDashboards
  } else if (hasExactPerms(["USAGE_REPORT_READ"])) {
    return topRoutes.usageReports
  } else if (hasExactPerms(["ROLE_READ"])) {
    return topRoutes.roles
  } else if (hasExactPerms(["BANDS_MAPPING_READ"])) {
    return topRoutes.bandsMappings
  } else if (hasExactPerms(["API_KEY_READ"])) {
    return topRoutes.apiKeys
  }

  // Note: is stupid that the dashboard requires permissions and redirects to
  // root, and then the default redirection is root... without any permission
  // requirement. But that will be fixed once the dashboard route gets
  // migrated. TODO remove this comment then
  logger.info("No accessible route found, redirecting to /")
  return ""
}
