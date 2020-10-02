import {Inputs, getInputs, getInputList} from '../src/inputs'

describe('getInputs', () => {
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

// Based on https://github.com/docker/build-push-action/blob/b1b7db3498a1941bc89504b474567da7ddc1341c/__tests__/context.test.ts#L3-L66
describe('getInputList', () => {
  it('handles single line correctly', async () => {
    setInput('foo', 'bar')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar'])
  })

  it('handles multiple lines correctly', async () => {
    setInput('foo', 'bar\nbaz')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })

  it('remove empty lines correctly', async () => {
    setInput('foo', 'bar\n\nbaz')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })

  it('handles comma correctly', async () => {
    setInput('foo', 'bar,baz')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })

  it('remove empty result correctly', async () => {
    setInput('foo', 'bar,baz,')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })

  it('handles different new lines correctly', async () => {
    setInput('foo', 'bar\r\nbaz')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })

  it('handles different new lines with spaces correctly', async () => {
    setInput('foo', 'bar \r\n baz')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })

  it('handles different new lines and comma correctly', async () => {
    setInput('foo', 'bar\r\nbaz,bat')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz', 'bat'])
  })

  it('handles different new lines and comma with spaces correctly', async () => {
    setInput('foo', ' bar \r\n baz , bat')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz', 'bat'])
  })

  it('handles multiple lines and ignoring comma correctly', async () => {
    setInput('cache-from', 'user/app:cache\ntype=local,src=path/to/dir')
    const res = await getInputList('cache-from', true)
    console.log(res)
    expect(res).toEqual(['user/app:cache', 'type=local,src=path/to/dir'])
  })

  it('handles different new lines and ignoring comma correctly', async () => {
    setInput('cache-from', 'user/app:cache\r\ntype=local,src=path/to/dir')
    const res = await getInputList('cache-from', true)
    console.log(res)
    expect(res).toEqual(['user/app:cache', 'type=local,src=path/to/dir'])
  })

  it('handles comma with spaces correctly', async () => {
    setInput('foo', 'bar , baz')
    const res = await getInputList('foo')
    console.log(res)
    expect(res).toEqual(['bar', 'baz'])
  })
})

function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
}

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value
}
