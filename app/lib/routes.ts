// (Almost) Single point of truth to define all available top routes, the ones
// used on the side navigation menu. However it will be cool if instead of being
// an object built by hand, to be a function that builds the available routes
// according to what is seen on the folder structure below `app/routes`, by
// interpreting names with Remix conventions. Left as TODO later.

export const topRoutes: { [index: string]: string } = {
  servicePoints: "servicePoints",
  devices: "devices",
  billings: "billings",
  users: "users",
  groups: "groups",
  dashboard: "dashboard",
  telemetryDashboards: "telemetryDashboards",
  usageReports: "usageReports",
  roles: "roles",
  bandsMappings: "bandsMappings",
  apiKeys: "apiKeys",
}
