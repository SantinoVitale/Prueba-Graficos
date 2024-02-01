import type { LoaderFunctionArgs } from "@remix-run/node"

import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { requireSession } from "~/fileSessions"
import { getServicePoints } from "~/services/servicePoints.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request)
  const result = await getServicePoints(request)

  return json(result)
}

export default function ServicePoints() {
  const loaderData = useLoaderData<typeof loader>()
  const { servicePoints } = loaderData.data

  return (
    <div>
      <h1>Service Points</h1>
      {!servicePoints?.length ?
        <div>No service points found</div>
      : <table role="grid">
          <thead>
            <tr>
              <th>ID de suministro</th>
              <th>Cliente</th>
              <th>Medidor</th>
              <th>Dispositivo</th>
              <th>Estado</th>
              <th>Leído</th>
              <th>Empresa</th>
            </tr>
          </thead>
          <tbody>
            {servicePoints.map((sp: any) => {
              return (
                <tr key={sp.id}>
                  <td>{sp.servicePointID}</td>
                  <td>{sp.client}</td>
                  <td>{sp.meterSerialNumber}</td>
                  <td>{sp.device?.id}</td>
                  <td>{sp.device?.state}</td>
                  <td>{sp.lastRead?.obtained}</td>
                  <td>{sp.tenant.name}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      }
    </div>
  )
}
