import * as please from '../src/please'

describe('buildArgs', () => {
  it('returns args with empty inputs', async () => {
    expect(
      please.buildArgs({
        include: [],
        exclude: [],
        output: please.Output.PLAIN,
        verbosity: undefined
      })
    ).toStrictEqual(['--plain_output'])
  })

  it('returns args with empty inputs', async () => {
    expect(
      please.buildArgs({
        include: ['label1'],
        exclude: ['label2', 'label3'],
        output: please.Output.ALL,
        verbosity: please.Verbosity.DEBUG
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
