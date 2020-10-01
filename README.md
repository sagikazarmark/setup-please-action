# Setup Please action

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/sagikazarmark/setup-please-action/build-test?style=flat-square)](https://github.com/sagikazarmark/setup-please-action/actions?query=workflow%3Abuild-test)

**GitHub action to setup [Please](https://please.build/) for building projects.**

## Features

- Automatically set `build.path` based on the `PATH` environment variable
- Automatically set profile (when configured)
- Automatically set plain output mode
- Detect and download the right Please version
- Download `pleasew` and expose it as `plz` executable in `PATH`
- Automatically save logs at the end of the job


## Why not just `./pleasew`?

Please comes with an install script in every project by default when you first initialize them with `plz init`.
`pleasew` is able to download Please to a common location, if it's not already installed
which makes using Please quite portable.

There are a couple issues with this script though. It doesn't take platform and profile specific config into account
which could lead to incorrect version detection. It's not a surprise though, parsing the config file format from plain Shell is hard.
The action is written in TypeScript and has a better config parser.

The action can also work better with self-hosted runners: it utilizes [tool cache](https://github.com/actions/toolkit/tree/main/packages/tool-cache)
to save downloaded binaries into cache, so the runner doesn't have to download it on each run.

Ultimately, the action provides better integration with GitHub Actions and can save you from some duplications.


## Usage

### Inputs

Following inputs can be used as `step.with` keys

| Name                | Type    | Description                        |
|---------------------|---------|------------------------------------|
| `version`           | String  | Please version. Overrides the version in `.plzconfig`. |
| `profile`           | String  | [Configuration](https://please.build/config.html) profile name |
| `save-logs`         | Bool    | Save build logs as artifacts at the end of each job |


### Save logs

By default, Please runs with `-p` (plain output) when using this action.
In order to debug potential build failures, you need to examine the logs in `plz-out/log`.

Without using this action, logs can easily be saved as artifacts with a few lines of YAML:

```yaml
      - name: Save Please log output
        uses: actions/upload-artifact@v1
        with:
          name: build-log
          path: plz-out/log
```

When using this action, you can simply enable `save-logs` and forget about it.

**Note: for the time being enabling `save-logs` is not enough, you also need to pass the `matrix` as an environment variable if you utilize the [build matrix](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/managing-complex-workflows#using-a-build-matrix) feature.**
**See [#6](https://github.com/sagikazarmark/setup-please-action/issues/6) for more details.**

```yaml
      - name: Set up Please
        uses: sagikazarmark/setup-please-action@v0
        with:
          save-logs: 'true'
        env:
          # See https://github.com/sagikazarmark/setup-please-action/issues/6
          MATRIX_CONTEXT: ${{ toJson(matrix) }}
```


## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
