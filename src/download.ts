import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import os from 'os'
import {Config} from './config'

export async function download(config: Config): Promise<void> {
  let version: string = config.version

  if (version == 'latest') {
    version = await findLatestVersion(config.downloadlocation)
  }

  const baseUrl: string = config.downloadlocation
  const downloadUrl = `${baseUrl}/${platform()}_${arch()}/${version}/please_${version}.tar.xz`

  const pleaseArchive = await tc.downloadTool(downloadUrl)
  const pleaseExtractedFolder = await tc.extractZip(
    pleaseArchive,
    `${os.homedir()}/.please/${version}`
  )

  const cachedPath = await tc.cacheDir(pleaseExtractedFolder, 'please', version)
  core.addPath(cachedPath)
}

async function findLatestVersion(downloadLocation: string): Promise<string> {
  // TODO: find latest version
  return ''
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
