import { getGqlFetcher } from "./fetchers.server"

export const getUserInfo = async (request: Request): Promise<any> => {
  const gqlGetUserInfo = `
    query GetUserInfo {
      user: self {
        id
        name
        email
        image
        locale
        tenant {
          id
          name
          description
          image
        }
      }
    }
  `

  const gqlFetch = await getGqlFetcher(request)
  const result = gqlFetch && (await gqlFetch(gqlGetUserInfo))
  return result
}

export const setNewLanguage = async (
  request: Request,
  language: string,
): Promise<any> => {
  const gqlSetNewLanguage = `
    mutation SetNewLanguage (
      $locale: LocalesEnumType!
    ) {
      setLocale(locale: $locale) {
        name
        locale
      }
    }
  `

  const gqlFetch = await getGqlFetcher(request)
  const result =
    gqlFetch && (await gqlFetch(gqlSetNewLanguage, { locale: language }))
  return result
}

export const getPerms = async (request: Request): Promise<any> => {
  const gqlGetPerms = `
    query GetPermissions {
      self {
        permissions
      }
    }
`

  const gqlFetch = await getGqlFetcher(request)
  const result = gqlFetch && (await gqlFetch(gqlGetPerms))
  return result.data.self.permissions
}
