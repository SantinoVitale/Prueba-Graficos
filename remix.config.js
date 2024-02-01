/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    "@picocss/pico",

    // TODO until https://github.com/sergiodxa/remix-i18next/issues/143
    // gets fixed or a new pure ESM remix-i18next release comes, add missing
    // stuff to the bundle
    "remix-i18next",
    "accept-language-parser",
    "intl-parse-accept-language",
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
}
