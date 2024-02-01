type PasswordRequirements = {
  minLength: number
  mustHaveUpperCaseLetters: boolean
  mustHaveNumbers: boolean
  mustHaveSymbols: boolean
}

const hasRequiredLength = (password: string, minLength: number): boolean =>
  password.length >= minLength

const hasUppercase = (password: string): boolean => /[A-Z]/.test(password)

const hasNumbers = (password: string): boolean => /[0-9]/.test(password)

const hasSymbols = (password: string): boolean =>
  /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/.test(password)

export const isValidPassword = (
  password: string,
  rules: PasswordRequirements,
): boolean => {
  return (
    hasRequiredLength(password, rules.minLength) &&
    (rules.mustHaveUpperCaseLetters ? hasUppercase(password) : true) &&
    (rules.mustHaveNumbers ? hasNumbers(password) : true) &&
    (rules.mustHaveSymbols ? hasSymbols(password) : true)
  )
}
