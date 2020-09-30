import {Inputs, getInputs} from '../src/inputs'

describe('get inputs', () => {
  it('returns inputs with defaults', async () => {
    const inputs: Inputs = getInputs()

    expect(inputs).toStrictEqual({
      version: '',
      profile: '',
      saveLogs: false
    })
  })

  it('returns inputs', async () => {
    setInput('version', '15.5.0')
    setInput('profile', 'ci')
    setInput('save-logs', 'true')

    const inputs: Inputs = getInputs()

    expect(inputs).toStrictEqual({
      version: '15.5.0',
      profile: 'ci',
      saveLogs: true
    })
  })
})

function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
}

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value
}
