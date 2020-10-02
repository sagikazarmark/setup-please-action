import {Inputs, PleaseOutput, PleaseVerbosity} from '../src/inputs'
import {buildArgs} from '../src/please'

describe('buildArgs', () => {
  it('returns args with empty inputs', async () => {
    expect(
      buildArgs({
        version: '',
        profile: '',
        include: [],
        exclude: [],
        output: PleaseOutput.PLAIN,
        verbosity: undefined,
        saveLogs: false
      })
    ).toStrictEqual(['--plain_output'])
  })

  it('returns args with empty inputs', async () => {
    expect(
      buildArgs({
        version: '',
        profile: '',
        include: ['label1'],
        exclude: ['label2', 'label3'],
        output: PleaseOutput.ALL,
        verbosity: PleaseVerbosity.DEBUG,
        saveLogs: false
      })
    ).toStrictEqual([
      '--show_all_output',
      '--verbosity',
      'debug',
      '--include',
      'label1',
      '--exclude',
      'label2',
      '--exclude',
      'label3'
    ])
  })
})
