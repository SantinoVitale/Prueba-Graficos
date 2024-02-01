// An (maybe) overengineered module to compose a proper name abbreviation for
// user names
// Based on Spanish last-names rules taken from here:
// https://www.elespanol.com/curiosidades/apellidos-compuestos-espanoles-frecuentes-origen/761173978_0.html

import invariant from "tiny-invariant"

type StringSource = "name" | "email"

const extractInitials = (source: string): string => source[0].toUpperCase()

const buildWithDash = (source: string): string => {
  // considers only the last name, returns strings like 'A-B'
  const parts = source.split(/\s+/)
  for (const token of parts) {
    if (/-/.test(token)) {
      const lastName = token.split("-")
      return lastName.map(extractInitials).join("-")
    }
  }
  return ""
}

const commonExtractor = ({
  firstNames,
  lastNames,
  conector,
}: {
  firstNames: string
  lastNames: string
  conector: string
}): string => {
  const firstParts = firstNames.split(/\s+/)
  const lastParts = lastNames.split(/\s+/)
  const first = extractInitials(firstParts[0])
  const last = extractInitials(lastParts[0])
  return `${first}${conector}${last}`
}

const buildWithDeLos = (source: string): string => {
  // considers only the first first-name, and the first last name
  // returns strings like 'AdlB'
  const [firstNames, lastNames] = source.split(/\Wde los\W/)
  return commonExtractor({ firstNames, lastNames, conector: "dl" })
}

const buildWithDeLa = (source: string): string => {
  // considers only the first first-name, and the first last name
  // returns strings like 'AdlB'
  const [firstNames, lastNames] = source.split(/\Wde la\W/)
  return commonExtractor({ firstNames, lastNames, conector: "dl" })
}

const buildWithDel = (source: string): string => {
  // "Del" is considered part of the last name. Use only one first first-name
  // and the first last name
  // returns strings like 'ADB'
  const [firstNames, lastNames] = source.split(/\Wdel\W/)
  return commonExtractor({ firstNames, lastNames, conector: "D" })
}

const buildWithDe = (source: string): string => {
  // use first first-name and first last name
  // returns strings like 'AdB'
  const [firstNames, lastNames] = source.split(/\Wde\W/)
  return commonExtractor({ firstNames, lastNames, conector: "d" })
}

const buildWithName = (source: string): string => {
  // Spanish last names can have 5 tipes of composition
  const patterns: Record<string, (source: string) => string> = {
    dash: (source: string) =>
      /[a-zA-Z ]+-[a-zA-Z ]+/.test(source) ? buildWithDash(source) : "",

    delos: (source: string) =>
      /\w+\s+de\s+los\s+\w+/.test(source) ? buildWithDeLos(source) : "",

    // same as 'delos'
    dela: (source: string) =>
      /\w+\s+de\s+la\s+\w+/.test(source) ? buildWithDeLa(source) : "",

    del: (source: string) =>
      /\w+\s+del\s+\w+/.test(source) ? buildWithDel(source) : "",

    de: (source: string) =>
      /\w+\s+de\s+(?!la\s+)\w+/.test(source) ? buildWithDe(source) : "",
  }

  const testingOrder = ["dash", "delos", "dela", "del", "de"]
  for (const field of testingOrder) {
    const result = patterns[field](source)
    if (result) {
      return result
    }
  }

  // if we haven't returned yet, just pick up to the first three words
  const parts = source.split(/\s+/)
  const initials = parts.map(extractInitials)
  return initials.slice(0, 3).join("")
}

const buildWithEmail = (source: string): string => {
  const username = source.split("@")[0]
  if (username.includes(".")) {
    const parts = username.split(".")
    const initials = parts.map(extractInitials)
    return `@${initials.join("").slice(0, 2)}`
  }

  return `@${username[0].toUpperCase()}`
}

export const buildAvatarString = (
  source: string,
  type: StringSource,
): string => {
  invariant(source, "Need a source string to build avatar string")
  invariant(type, "Need the source type to build avatar string")

  const builders = {
    name: buildWithName,
    email: buildWithEmail,
  }

  return builders[type](source)
}
