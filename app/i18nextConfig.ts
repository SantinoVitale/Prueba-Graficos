export default {
  // Languages your application supports
  supportedLngs: ["en", "es", "pt"],

  // when `true`, consider variants as supported when the main language is.
  // E.g. 'en-US' will be valid if 'en' is in supportedLngs
  nonExplicitSupportedLngs: true,

  // Language to use in case the user language is not supported
  fallbackLng: "en",

  // Default namespace used when no one is provided to `useTranslation()`
  defaultNS: "common",

  // Disabling suspense is recommended
  react: { useSuspense: false },
}
