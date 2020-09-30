import os from 'os'

// Based on https://github.com/actions/setup-go/blob/7ff6287c800e9b340178c6e85d648e9328975ab0/src/system.ts

export function getPlatform(): string {
  // darwin, linux and freebsd match already

  // 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'
  let platform: string = os.platform()

  // wants 'darwin', 'freebsd', 'linux', 'windows'
  if (platform === 'win32') {
    platform = 'windows'
  }

  return platform
}

export function getArch(): string {
  // 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'.
  let arch: string = os.arch()

  // wants amd64, 386, arm64, armv61, ppc641e, s390x
  // only amd64 is supported
  switch (arch) {
    case 'x64':
      arch = 'amd64'
      break
    // case 'ppc':
    //   arch = 'ppc64'
    //   break
    case 'x32':
      arch = '386'
      break
  }

  return arch
}
