import * as jose from "jose"

const currentSeconds = () => Math.floor(new Date().getTime() / 1000)

export const shouldRenewToken = (token: string): boolean => {
  // checks token expiration and returns true if it expires in less than ten
  // seconds. Also return true if there's no expiration claim
  const claims = jose.decodeJwt(token)

  return !claims.exp ? true : claims.exp - currentSeconds() < 10
}
