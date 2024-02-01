import { Outlet } from "@remix-run/react"

export default function AuthLayout() {
  return (
    <>
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
