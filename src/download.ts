import * as core from '@actions/core'
import * as httpm from '@actions/http-client'
import * as tc from '@actions/tool-cache'
import {promises as fs} from 'fs'
import path from 'path'
import {Config} from './config'
import * as system from './system'

export async function download(config: Config): Promise<void> {
  await downloadPlease(config)
  await downloadPlz(config.version)
}

async function downloadPlease(config: Config): Promise<void> {
  let version: string = config.version

  if (version === 'latest') {
    core.info('Finding latest version')

    version = (await findLatestVersion(config.downloadlocation)).trim()

    core.info(`Latest version is '${version}'`)
  }

  let toolPath: string
  toolPath = tc.find('please', version)

  // If not found in cache, download
  if (toolPath) {
    core.info(`Found Please in cache @ ${toolPath}`)

    core.addPath(toolPath)

    return
  }

  core.info(`Attempting to download Please ${version}...`)

  const baseUrl: string = config.downloadlocation
  const platform: string = system.getPlatform()
  const arch: string = system.getArch()
  const downloadUrl = `${baseUrl}/${platform}_${arch}/${version}/please_${version}.tar.xz`

  const pleaseArchive = await tc.downloadTool(downloadUrl)

  toolPath = path.join(config.location, version)
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
  const toolPath = tc.find('plz', version)

  // If not found in cache, download
  if (toolPath) {
    core.info(`Found plz in cache @ ${toolPath}`)

    core.addPath(toolPath)

    return
  }

  core.info(`Attempting to download plz ${version}...`)

  const downloadUrl =
    'https://raw.githubusercontent.com/thought-machine/please/306dc7cfcbab8d9472c9a349deaaab1b658b51b8/pleasew'

  const plzTool = await tc.downloadTool(downloadUrl)
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
