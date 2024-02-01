export const getPermsCheckers = (rolePerms: string[]) => ({
  // returns a couple of functions to check against given permissions
  hasExactPerms: (requiredPerms: string[]): boolean =>
    requiredPerms.every(perm => rolePerms.includes(perm)),

  hasAnyPerm: (requiredPerms: string[]): boolean =>
    requiredPerms.some(perm => rolePerms.includes(perm)),
})
