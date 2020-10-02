import * as core from '@actions/core'

export enum Output {
  PLAIN,
  ALL
}

export enum Verbosity {
  ERROR,
  WARNING,
  NOTICE,
  INFO,
  DEBUG
}

export interface Inputs {
  include: string[]
  exclude: string[]
  output: Output
  verbosity: Verbosity | undefined
}

export function buildArgs(inputs: Inputs): string[] {
  const args: string[] = []

  switch (inputs.output) {
    case Output.PLAIN:
      args.push('--plain_output')
      break

    case Output.ALL:
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
    args.push('--verbosity', Verbosity[inputs.verbosity].toLowerCase())
  }

  for (const label of inputs.include) {
    args.push('--include', label)
  }

  for (const label of inputs.exclude) {
    args.push('--exclude', label)
  }

  return args
}
