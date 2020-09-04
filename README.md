# track-build-errors-action

This action handles the tracking of job-level failures for a build, with the intent to later send a summary message to Slack. **Please note that this action is meant to be used in tandem with [notify-slack-errors-action](https://github.com/spring-projects/notify-slack-errors-action).**

## Strategy
Github Actions currently does not have strong support for accessing failed jobs across a build programatically. In order to provide that functionality, this action tracks and exports a .txt at the end of each job, should any of that job's steps fail. Then, at the end of a build, we read these errors files and create a summary error message to send to Slack using the [notify-slack-errors-action](https://github.com/spring-projects/notify-slack-errors-action) action.

In order to use this action, make sure to do two things:

1. Initiate error tracking by invoking the action with the job name input set to "initiate-error-tracking" at the start of your build. Then, make sure to export the job-initiate-error-tracking.txt file. This ensures that the `errors` folder is created on the file system within the scope of the action, which is required for the later import of the errors file within the Slack notification job. This is included in the example usage below.

2. Invoke this action and export the errors file as the last step of every job in your build. Both of these steps should use `if: ${{ failure() }}` logic to ensure we create error output if the job actually failed. This is also included in the example below.

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

