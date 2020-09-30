export function getWorkspaceDirectory(): string {
  const workspaceDirectory = process.env['GITHUB_WORKSPACE']
  if (!workspaceDirectory) {
    throw new Error('Unable to get GITHUB_WORKSPACE env variable')
  }

  return workspaceDirectory
}
