import path from 'path'
import os from 'os'
import {readFiles} from './fs-helper'

export type Config = Record<string, string>

const defaultConfig: Config = {
  version: 'latest',
  location: path.join(process.env['HOME'] as string, '.please'),
  downloadlocation: 'https://get.please.build'
}

export async function loadConfig(profile: string): Promise<Config> {
  const files = await readConfigFiles(profile)

  return parseConfigs(files)
}

async function readConfigFiles(profile: string): Promise<string[]> {
  const platform = os.platform().toString()
  const workspace = process.env['GITHUB_WORKSPACE'] as string

  const configFiles = [
    path.join(workspace, '.plzconfig'),
    path.join(workspace, `.plzconfig.${platform}`)
  ]

  if (profile) {
    configFiles.push(path.join(workspace, `.plzconfig.${profile}`))
  }

  return readFiles(configFiles)
}

const keyValueRe = /^\s*([A-Za-z0-9\-_]+)\s*=\s*(?:'|")?([A-Za-z0-9\-._/]+)(?:'|")?\s*$/

// Parse the contents of a git-config/INI-like file.
// It parses the "please" section of the file and returns a config object.
export function parseConfig(contents: string): Config {
  const config: Config = {}

  const lines: string[] = contents.split(/[\r\n]+/)

  let isPleaseSection = false

  for (const line of lines) {
    // Look for the please section
    if (line.trimStart().match(/^\s*\[please\]\s*$/i)) {
      isPleaseSection = true

      continue
    }

    // Check if we are in a please section
    if (!isPleaseSection) {
      continue
    }

    // End of please section
    if (line.trimStart().startsWith('[')) {
      break
    }

    const match = line.trim().match(keyValueRe)
    if (match) {
      config[match[1].toLowerCase()] = match[2]
    }
  }

  return config
}

// Parse all config files loaded in order of precedence: https://please.build/config.html
// Also returns default values for keys not available in the parsed configs.
export function parseConfigs(fileContents: string[]): Config {
  const config: Config = defaultConfig

  for (const contents of fileContents) {
    const parsedConfig: Config = parseConfig(contents)
    for (const key in parsedConfig) {
      if (Object.prototype.hasOwnProperty.call(parsedConfig, key)) {
        config[key] = parsedConfig[key]
      }
    }
  }

  return config
}
