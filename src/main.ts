import * as artifact from '@actions/artifact'
import * as glob from '@actions/glob'
import * as core from '@actions/core'
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

    const version = core.getInput('version')
    if (version) {
      core.info(`Overriding Please version, using ${version}`)

      overrides += `,please.version:${version}`
    }

    // Override the build path using the current PATH
    core.exportVariable('PLZ_OVERRIDES', overrides)

    const profile = core.getInput('profile')
    if (profile) {
      core.info(`Using profile ${profile}`)

      core.exportVariable('PLZ_CONFIG_PROFILE', profile)
    }

    // Set Please arguments
    core.exportVariable('PLZ_ARGS', '-p')

    // TODO: download please upfront
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function post(): Promise<void> {
  try {
    // saveLogs will be false unless true is the exact input
    const saveLogs: boolean =
      (core.getInput('save-logs') || 'false').toUpperCase() === 'TRUE'

    if (saveLogs) {
      const job = (process.env['GITHUB_JOB'] as string) || ''
      const artifactName = `${job}-log`

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

// Main
if (!stateHelper.IsPost) {
  run()
}
// Post
else {
  post()
}
