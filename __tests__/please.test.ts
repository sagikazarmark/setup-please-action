import * as please from '../src/please'

describe('buildArgs', () => {
  it('returns args with empty inputs', async () => {
    expect(
      please.buildArgs({
        version: '',
        profile: '',
        include: [],
        exclude: [],
        output: please.Output.PLAIN,
        verbosity: undefined,
        saveLogs: false
      })
    ).toStrictEqual(['--plain_output'])
  })

  it('returns args with empty inputs', async () => {
    expect(
      please.buildArgs({
        version: '',
        profile: '',
        include: ['label1'],
        exclude: ['label2', 'label3'],
        output: please.Output.ALL,
        verbosity: please.Verbosity.DEBUG,
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
