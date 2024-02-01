import { promisify } from "node:util"
import { exec } from "node:child_process"

import logger from "~/lib/logger.server"

const pexec = promisify(exec)

const isValidCommitHash = (hash: string): boolean => {
  const shortHashRe = /[0-9a-fA-F]{7}/
  return shortHashRe.test(hash)
}

export const getCurrentCommit = async (): Promise<string> => {
  try {
    const { stdout, stderr } = await pexec("git log --format='%h' -1")
    return (
      stderr ? ""
      : isValidCommitHash(stdout) ? stdout
      : ""
    )
  } catch (error) {
    logger.error(error)
    return ""
  }
}
