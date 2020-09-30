import {getWorkspaceDirectory} from '../src/context'

describe('getWorkspaceDirectory', () => {
  it('throws an error when no workspace is found', async () => {
    process.env['GITHUB_WORKSPACE'] = '/home/github'

    expect(getWorkspaceDirectory()).toStrictEqual('/home/github')

    delete process.env['GITHUB_WORKSPACE']
  })

  it('throws an error when no workspace is found', async () => {
    expect(() => {
      getWorkspaceDirectory()
    }).toThrowError('Unable to get GITHUB_WORKSPACE env variable')
  })
})
