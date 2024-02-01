import log4js from "log4js"

import { config } from "~/../config"

const logLevel = "[%p]"
const category = "(%c)"
const newLine = "%n"
const logData = "%m"
const fileName = "%f{2}"
const lineNumber = "%l"
const columnNumber = "%o"

log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: `%[${logLevel} ${category} ${fileName}:${lineNumber}:${columnNumber}%] ${logData}${newLine}`,
      },
    },
  },
  categories: {
    default: {
      appenders: ["out"],
      level: config.logLevel,
      enableCallStack: true,
    },
  },
})

const logger = log4js.getLogger()

export default logger
