const core = require('@actions/core');
const fs = require('fs');

try {
  const jobName = core.getInput('job-name');
  if (jobName === "initiate-error-tracking") {
    fs.writeFileSync(`job-${jobName}.txt`, "");
  } else {
    fs.writeFileSync(`job-${jobName}.txt`, `:no_entry_sign: *${jobName}* failed \n`);
  }
} catch (err) {
  core.setFailed(err.message);
}
