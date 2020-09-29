import * as core from '@actions/core'
import {promises as fs} from 'fs'

export async function readFiles(fileNames: string[]): Promise<string[]> {
  const fileContents: string[] = []

  for (const fileName of fileNames) {
    try {
      const contents = await fs.readFile(fileName, 'utf8')

      fileContents.push(contents)
    } catch (error) {
      if (error.code === 'ENOENT') {
        core.debug(`File ${fileName} not found!`)
      } else {
        throw error
      }
    }
  }

  return fileContents
}
