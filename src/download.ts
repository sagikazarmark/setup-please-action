import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {promises as fs} from 'fs'
import os from 'os'
import path from 'path'
import {Config} from './config'

export async function download(config: Config): Promise<void> {
  let version: string = config.version

  if (version === 'latest') {
    version = await findLatestVersion(config.downloadlocation)
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

async function findLatestVersion(downloadLocation: string): Promise<string> {
  // TODO: find latest version
  downloadLocation = ''
  return downloadLocation
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
