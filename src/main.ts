import * as artifact from '@actions/artifact'
import * as core from '@actions/core'
import {context} from '@actions/github'
import * as glob from '@actions/glob'
import {promises as fs} from 'fs'
import path from 'path'
import {Config, loadConfig} from './config'
import {getWorkspaceDirectory} from './context'
import {download} from './download'
import {Inputs, getInputs} from './inputs'
import * as stateHelper from './state-helper'

async function run(): Promise<void> {
  try {
    const inputs: Inputs = getInputs()

    const overrides: string[] = []

    const buildPath = (process.env['PATH'] as string) || ''
    if (buildPath) {
      overrides.push(`build.path:${buildPath}`)
    } else {
      core.warning('PATH is empty')
    }

    if (inputs.profile) {
      core.info(`Using profile ${inputs.profile}`)

      core.exportVariable('PLZ_CONFIG_PROFILE', inputs.profile)
    }

    const config: Config = await loadConfig(inputs.profile)

    if (inputs.version) {
      core.info(`Overriding Please version, using ${inputs.version}`)

      overrides.push(`please.version:${inputs.version}`)

      config.version = inputs.version
    }

    // Override the build path using the current PATH
    if (overrides.length > 0) {
      core.exportVariable('PLZ_OVERRIDES', overrides.join(','))
    }

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
    const inputs: Inputs = getInputs()

    if (inputs.saveLogs) {
      const job = jobName()

      core.info(`Saving logs for job '${job}'`)

      const artifactName = `${job}-log`

      const artifactClient: artifact.ArtifactClient = artifact.create()

      const rootDirectory = path.join(getWorkspaceDirectory(), 'plz-out/log')

      try {
        await fs.access(rootDirectory)
      } catch (error) {
        core.warning('Please log directory not found')

        return
      }

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
