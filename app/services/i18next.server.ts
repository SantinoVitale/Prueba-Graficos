import Backend from "i18next-fs-backend"
import { RemixI18Next } from "remix-i18next"
import { resolve } from "node:path"

import i18nextConfig from "~/i18nextConfig"
import { languageCookie } from "./cookie.server"

const i18next = new RemixI18Next({
  detection: {
    cookie: languageCookie,
    supportedLanguages: i18nextConfig.supportedLngs,
    fallbackLanguage: i18nextConfig.fallbackLng,
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18nextConfig,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
    },
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
  plugins: [Backend],
})

export default i18next
