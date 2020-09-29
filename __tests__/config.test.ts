import {parseConfig, parseConfigs} from '../src/config'

test('parse config', async () => {
  const plzconfig = `[please]
  version = 15.5.0

  [go]
  importpath = emperror.dev/emperror

  [buildconfig]
  golangci-lint-version = 1.31.0
  gotestsum-version = 0.5.3

  [alias "lint"]
  desc = Runs linters for this repo
  cmd = run ///pleasings2//tools/go:golangci-lint -- run

  [alias "gotest"]
  desc = Runs tests for this repo
  cmd = run ///pleasings2//tools/go:gotestsum -- --no-summary=skipped --format short -- -race -covermode=atomic -coverprofile=plz-out/log/coverage.txt ./...

  [alias "release"]
  desc = Release a new version
  cmd = run ///pleasings2//tools/misc:releaser --
`

  let config = parseConfig(plzconfig)

  expect(config.version).toBe('15.5.0')
})

test('parse config with idiotic casing and spaces', async () => {
  const plzconfig = `[go]
  importpath = emperror.dev/emperror

  [alias "lint"]
  desc = Runs linters for this repo
  cmd = run ///pleasings2//tools/go:golangci-lint -- run

  [PlEaSe]
        version     =     15.5.0

  [buildconfig]
  golangci-lint-version = 1.31.0
  gotestsum-version = 0.5.3
`

  let config = parseConfig(plzconfig)

  expect(config.version).toBe('15.5.0')
})

test('parse all configs', async () => {
  const plzconfig = `[please]
  version = 15.5.0
`

  const platformPlzconfig = `[please]
version = 15.4.0
`

  const profilePlzconfig = `[please]
location = "/home/github"
`

  let config = parseConfigs([plzconfig, platformPlzconfig, profilePlzconfig])

  expect(config.version).toBe('15.4.0')
  expect(config.location).toBe('/home/github')
  expect(config.downloadlocation).toBe('https://get.please.build')
})
