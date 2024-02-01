import { getGqlFetcher } from "~/services/fetchers.server"

const gqlGetServicePoints = `
query GetServicePoints(
  $canReadReads: Boolean!
  $canReadDevices: Boolean!
) {
  servicePoints(limit: 25) {
    id
    servicePointID
    description
    serviceType
    client {
      id
      name
      clientID
    }
    tenant {
      id
      name
      description
      image
    }
    meterMake
    meterModel
    meterSerialNumber
    meterID
    device @include(if: $canReadDevices) {
      id
      name
      hardwareType
      serialNumber
      image
      genericImage
      state
    }
    lastRead @include(if: $canReadReads) {
      id
      source
      obtained
      metadata {
        meterMake
        meterModel
        meterSerialNumber
        meterID
        deviceHardwareType
        deviceSerialNumber
        position
        receivedCTVTFactor
        appliedCTVTFactor
        effectiveCTVTFactor
        bandsMapping
      }
      values(preferedMagnitudeOnly: true) {
        class
        description
        type
        value {
          ts
          n
          m {
            exponent
            mantissa
          }
        }
        unit
      }
    }
    attributes
  }
}
`

export const getServicePoints = async (request: Request): Promise<any> => {
  const gqlFetch = await getGqlFetcher(request)
  const result =
    gqlFetch &&
    (await gqlFetch(gqlGetServicePoints, {
      canReadReads: true,
      canReadDevices: true,
    }))
  return result
}
