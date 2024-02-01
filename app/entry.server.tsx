// By default, Remix will handle generating the HTTP Response for you.
// For more information, see https://remix.run/file-conventions/entry.server
import type { EntryContext } from "@remix-run/node"
import type { i18n as i18nType } from "i18next"

import { RemixServer } from "@remix-run/react"
import { createReadableStreamFromReadable } from "@remix-run/node"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "node:stream"
import { resolve } from "node:path"
import { isbot } from "isbot"
import { createInstance } from "i18next"
import { I18nextProvider, initReactI18next } from "react-i18next"
import Backend from "i18next-fs-backend"

import i18next from "~/services/i18next.server"
import i18nextConfig from "~/i18nextConfig"

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const callbackName =
    isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady"

  const i18nInstance = createInstance() as i18nType
  const lng = await i18next.getLocale(request)
  const ns = i18next.getRouteNamespaces(remixContext)

  await i18nInstance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup our backend
    .init({
      ...i18nextConfig,
      lng, // locale detected above
      ns, // The namespaces the routes about to render wants to use
      backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
    })

  return new Promise((resolve, reject) => {
    let didError = false

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18nInstance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          didError = true

          console.error(error)
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
