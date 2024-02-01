import { RiErrorWarningLine } from "react-icons/ri"

import { useRouteError, isRouteErrorResponse } from "@remix-run/react"

export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <div className="card w-auto bg-neutral text-error-content">
      <div className="card-body">
        {isRouteErrorResponse(error) ?
          <>
            <h2 className="card-title text-yellow-200">
              {error.status} {error.statusText}
            </h2>
            <div role="alert" className="alert alert-error">
              <RiErrorWarningLine />
              <p>{error.data}</p>
            </div>
          </>
        : error instanceof Error ?
          <>
            <h2 className="card-title text-yellow-200">Error</h2>
            <div role="alert" className="alert alert-error">
              <RiErrorWarningLine />
              <p>{error.message}</p>
            </div>
            <h3 className="text-yellow-200">The stack trace is:</h3>
            <p className="text-white">{error.stack}</p>
          </>
        : typeof error === "string" ?
          <>
            <h2 className="card-title text-yellow-200">Error</h2>
            <div role="alert" className="alert alert-error">
              <RiErrorWarningLine />
              <p>{error}</p>
            </div>
          </>
        : <>
            <h2 className="card-title text-yellow-200">Unknown Error</h2>
            <div role="alert" className="alert alert-error">
              <RiErrorWarningLine />
              <p>{JSON.stringify(error)}</p>
            </div>
          </>
        }
      </div>
    </div>
  )
}
