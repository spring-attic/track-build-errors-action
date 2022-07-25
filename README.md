# This repository is no longer actively maintained by VMware, Inc.


# track-build-errors-action

This action handles the tracking of job-level failures for a build, with the intent to later send a summary message to Slack. **Please note that this action is meant to be used in tandem with [notify-slack-errors-action](https://github.com/spring-projects/notify-slack-errors-action).**

## Strategy
Github Actions currently does not offer an easy way to programatically access failed jobs across a build. In order to provide that functionality, this action tracks and exports a job-specific errors file at the end of each job, should any of that job's steps fail. Then, at the end of a build, we read those errors files and create a summary error message to send to Slack using the [notify-slack-errors-action](https://github.com/spring-projects/notify-slack-errors-action).

In order to use this action, do the following:

1. Initiate error tracking by invoking the action with the `job-name` input set to `initiate-error-tracking` at the start of your build. Then, make sure to export the `job-initiate-error-tracking.txt` file. This ensures that the `errors` folder is created on the file system within the scope of the action, which is required for the later import of the errors folder when we use [notify-slack-errors-action](https://github.com/spring-projects/notify-slack-errors-action). This is shown in the example below.

2. Invoke this action and export the related errors file as the last step of every job in your build. Both of these steps should use `if: ${{ failure() }}` logic to ensure that error output is created upon job failure. This is also shown in the example below.

If you'd like an example that demonstrates the usage of this action and the [notify-slack-errors-action](https://github.com/spring-projects/notify-slack-errors-action), see this [sample project](https://github.com/elliedori/sample-action-usage-project).

## Inputs

### `job-name`
**Required** The name of the build job. Defaults to "".

## Example usage

```
jobs:
  initiate_error_tracking:
    name: Initiate job-level error tracking
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Initiate error tracking
        uses: spring-projects/track-build-errors-action@v1
        with:
          job-name: "initiate-error-tracking"
      - name: Export errors file
        uses: actions/upload-artifact@v2
        with:
          name: errors
          path: job-initiate-error-tracking.txt
  sample_job:
    name: Sample job
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Sample job step
        run: echo "This is a sample job step"
      - name: Track error step
        uses: spring-projects/track-build-errors-action@v0.01
        if: ${{ failure() }}
        with:
          job-name: ${{ github.job }}
      - name: Export errors file
        uses: actions/upload-artifact@v2
        if: ${{ failure() }}
        with:
          name: errors
          path: job-${{ github.job }}.txt
  ...
  notify_result: ...
  ```

## A note on storage
The error files created by this action are of negligible size. They will however end up using storage space in the long term, which Github limits for private repos. As such, you may want to consider adding a cleanup action that periodically cleans up your project's artifacts. If you'd like an example that demonstrates this behavior, see [this sample action](https://github.com/elliedori/sample-action-usage-project/blob/master/.github/workflows/sample-artifact-cleaner-workflow.yml).

The deletion logic as outlined in the example will not impact artifacts for in-progress builds. Please note that it uses a personal access token to call the Github API – if you're creating a similar action you'll need to set up a token for your repository.

Please also note that this example cleans up **all** of the project's artifacts – if your project has other artifacts that must be persisted long-term, you may want to write more fine-grained deletion logic.
