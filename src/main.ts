import * as artifact from '@actions/artifact'
import * as core from '@actions/core'
import {context} from '@actions/github'
import * as glob from '@actions/glob'
import {Config, loadConfig} from './config'
import {download} from './download'
import * as stateHelper from './state-helper'

async function run(): Promise<void> {
  try {
    let overrides = ''

    const path = (process.env['PATH'] as string) || ''
    if (path) {
      overrides += `build.path:${path}`
    } else {
      core.warning('PATH is empty')
    }

    const profile = core.getInput('profile')
    if (profile) {
      core.info(`Using profile ${profile}`)

      core.exportVariable('PLZ_CONFIG_PROFILE', profile)
    }

    const config: Config = await loadConfig(profile)

    const version = core.getInput('version')
    if (version) {
      core.info(`Overriding Please version, using ${version}`)

      overrides += `,please.version:${version}`

      config.version = version
    }

    // Override the build path using the current PATH
    core.exportVariable('PLZ_OVERRIDES', overrides)

    // Set Please arguments
    core.exportVariable('PLZ_ARGS', '-p')

    // Download Please
    await download(config)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function post(): Promise<void> {
  try {
    // saveLogs will be false unless true is the exact input
    const saveLogs: boolean = /true/i.test(core.getInput('save-logs'))

    if (saveLogs) {
      const artifactName = `${jobName()}-log`

      const artifactClient: artifact.ArtifactClient = artifact.create()

      const rootDirectory = 'plz-out/log'
      const options: artifact.UploadOptions = {
        continueOnError: true
      }

      const globber: glob.Globber = await glob.create(`${rootDirectory}/**`, {
        followSymbolicLinks: false
      })
      const files: string[] = await globber.glob()

      await artifactClient.uploadArtifact(
        artifactName,
        files,
        rootDirectory,
        options
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

function jobName(): string {
  // See https://github.com/sagikazarmark/setup-please-action/issues/6
  if (
    process.env.MATRIX_CONTEXT == null ||
    process.env.MATRIX_CONTEXT === 'null'
  ) {
    return context.job
  }

  const matrix = JSON.parse(process.env.MATRIX_CONTEXT)

  const value = Object.values(matrix).join('-')

  return value !== '' ? `${context.job}-${value}` : context.job
}

// Main
if (!stateHelper.IsPost) {
  run()
}
// Post
else {
  post()
}
