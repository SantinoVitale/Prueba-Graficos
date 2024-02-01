// Quick and dirty hack to get JWT from headers
// Should read if there's a better way using Apollo Client or urql
// If not, then make these functions more robust and add unit tests

// Sample header for main token:
// 'new-authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2E3Y2JlYTI2ZmY0OTYyYTE5NzUzZGEiLCJyZWZyIjoiSWFDSkdwaz0iLCJpYXQiOjE2OTc3MjQwMDYsImV4cCI6MTY5NzcyNDkwNn0._tSb9reGNS0s73hfcrcF5sH13P6TXQZjElaxncaDs6E',
export const extractAuthToken = (token: string): string => {
  return token === "None" ? token : token.split(" ")[1]
}

// Sample header for refresh token
// 'set-cookie': 'refresh-jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2E3Y2JlYTI2ZmY0OTYyYTE5NzUzZGEiLCJyZWZyIjoiSWFDSkdwaz0iLCJpYXQiOjE2OTc3MjQwMDYsImV4cCI6MTY5Nzg5NjgwNn0.ETRnY2pfyo5VuUvuW0_VE-xMXNbi4A9-dgSRHgf2EMk; Max-Age=172800; Path=/graphql; Expires=Sat, 21 Oct 2023 14:00:06 GMT; HttpOnly; Secure; SameSite=None',
export const extractRefreshToken = (token: string): string => {
  return token.split(";")[0].split("=")[1]
}
