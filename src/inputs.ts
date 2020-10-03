import * as core from '@actions/core'
import * as please from './please'

export interface Inputs {
  version: string
  profile: string
  include: string[]
  exclude: string[]
  output: please.Output
  verbosity: please.Verbosity | undefined
  saveLogs: boolean
}

export async function getInputs(): Promise<Inputs> {
  const output = core
    .getInput('output')
    .toUpperCase() as keyof typeof please.Output

  const verbosity = core
    .getInput('verbosity')
    .toUpperCase() as keyof typeof please.Verbosity

  return {
    version: core.getInput('version'),
    profile: core.getInput('profile'),
    include: await getInputList('include'),
    exclude: await getInputList('exclude'),
    output: please.Output[output] ?? please.Output.PLAIN,
    verbosity: please.Verbosity[verbosity],
    saveLogs: /true/i.test(core.getInput('save-logs'))
  }
}

// Based on https://github.com/docker/build-push-action/blob/b1b7db3498a1941bc89504b474567da7ddc1341c/src/context.ts#L132-L144
export async function getInputList(
  name: string,
  ignoreComma?: boolean
): Promise<string[]> {
  const items = core.getInput(name)
  if (items === '') {
    return []
  }

  return items
    .split(/\r?\n/)
    .filter(x => x)
    .reduce<string[]>(
      (acc, line) =>
        acc
          .concat(!ignoreComma ? line.split(',').filter(x => x) : line)
          .map(pat => pat.trim()),
      []
    )
}
