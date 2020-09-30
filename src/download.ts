import * as core from '@actions/core'
import * as httpm from '@actions/http-client'
import * as tc from '@actions/tool-cache'
import {promises as fs} from 'fs'
import os from 'os'
import path from 'path'
import {Config} from './config'

export async function download(config: Config): Promise<void> {
  await downloadPlease(config)
  await downloadPlz(config.version)
}

async function downloadPlease(config: Config): Promise<void> {
  let version: string = config.version

  if (version === 'latest') {
    core.info('finding latest version')

    version = await findLatestVersion(config.downloadlocation)

    core.info(`latest version is '${version}'`)
  }

  const baseUrl: string = config.downloadlocation
  const downloadUrl = `${baseUrl}/${platform()}_${arch()}/${version}/please_${version}.tar.xz`

  const pleaseArchive = await tc.downloadTool(downloadUrl)

  const toolPath = path.join(config.location, version)
  const pleaseExtractedFolder = await tc.extractTar(pleaseArchive, toolPath, [
    'xJ',
    '--strip-components=1'
  ])

  const cachedPath = await tc.cacheDir(pleaseExtractedFolder, 'please', version)
  core.addPath(cachedPath)

  const pleaseFiles: string[] = await fs.readdir(cachedPath)

  for (const file of pleaseFiles) {
    await fs.symlink(
      path.join(toolPath, file),
      path.join(config.location, file)
    )
  }
}

async function downloadPlz(version: string): Promise<void> {
  const downloadUrl =
    'https://raw.githubusercontent.com/thought-machine/please/306dc7cfcbab8d9472c9a349deaaab1b658b51b8/pleasew'

  const plzTool = await tc.downloadTool(downloadUrl, '/usr/local/bin/plz')
  await fs.chmod(plzTool, 0o755)

  const cachedPath = await tc.cacheFile(plzTool, 'plz', 'plz', version)

  core.addPath(cachedPath)
}

async function findLatestVersion(downloadLocation: string): Promise<string> {
  const http = new httpm.HttpClient(`please/setup-please-action`, [], {
    allowRetries: true,
    maxRetries: 5
  })

  try {
    const response: httpm.HttpClientResponse = await http.get(
      `${downloadLocation}/latest_version`
    )
    if (response.message.statusCode !== 200) {
      throw new Error(
        `failed to get latest version. Code(${response.message.statusCode}) Message(${response.message.statusMessage})`
      )
    }

    return response.readBody()
  } catch (error) {
    throw new Error(`failed to get latest version: ${error.message}`)
  }
}

function platform(): string {
  return os.platform().toString()
}

function arch(): string {
  switch (os.arch()) {
    case 'x32':
      return '386'

    case 'x64':
      return 'amd64'

    default:
      throw Error('unsupported arch')
  }
}
