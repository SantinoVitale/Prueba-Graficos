import { getGqlFetcher } from "~/services/fetchers.server"

export const getTenantGroups = async (request: Request): Promise<any> => {
  const gqlQuery = `
  query GetTenantGroups($filter: GroupFilterInputType) {
    groups(filter: $filter) {
      id
      name
    }
  }
`

  const gqlFetch = await getGqlFetcher(request)
  const result = await gqlFetch(gqlQuery)
  return result
}

export const getRoles = async (request: Request): Promise<any> => {
  const gqlQuery = `
  query GetRoles($filter: RoleFilterInputType) {
    roles(filter: $filter) {
      id
      name
      description
      tenant {
        id
        name
        description
        image
      }
      permissions {
        id
        premium
        expires
        expired
        name
        isCovered
      }
      attributes
      isCovered
      isClient
    }
  }
`

  const gqlFetch = await getGqlFetcher(request)
  const result = await gqlFetch(gqlQuery)
  return result
}

export const getPermissions = async (request: Request): Promise<any> => {
  const gqlQuery = `
  query GetPermissions {
    self {
      id
      permissions
    }
  }
`

  const gqlFetch = await getGqlFetcher(request)
  const result = await gqlFetch(gqlQuery)
  return result
}
