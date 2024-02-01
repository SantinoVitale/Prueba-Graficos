export type GraphQlError = {
  message: string
  locations?: object[]
  path?: string[]
}

export type GraphQlResponse<T> = {
  data?: T
  errors?: GraphQlError[]
  extensions?: object
}
