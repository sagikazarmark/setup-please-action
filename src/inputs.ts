import * as core from '@actions/core'

export interface Inputs {
  version: string
  profile: string
  saveLogs: boolean
}

export function getInputs(): Inputs {
  return {
    version: core.getInput('version'),
    profile: core.getInput('profile'),
    saveLogs: /true/i.test(core.getInput('save-logs'))
  }
}
