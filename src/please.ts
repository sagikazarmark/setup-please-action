import * as core from '@actions/core'
import {Inputs, PleaseOutput, PleaseVerbosity} from './inputs'

export function buildArgs(inputs: Inputs): string[] {
  const args: string[] = []

  switch (inputs.output) {
    case PleaseOutput.PLAIN:
      args.push('--plain_output')
      break

    case PleaseOutput.ALL:
      args.push('--show_all_output')
      break

    default:
      core.warning(
        `Invalid output type ${inputs.output}: falling back to PLAIN`
      )

      args.push('--plain_output')
      break
  }

  if (inputs.verbosity) {
    args.push('--verbosity', PleaseVerbosity[inputs.verbosity].toLowerCase())
  }

  for (const label of inputs.include) {
    args.push('--include', label)
  }

  for (const label of inputs.exclude) {
    args.push('--exclude', label)
  }

  return args
}
