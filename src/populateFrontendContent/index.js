const fs = require('fs');
const path = require('path');
const util = require('util');
const AWS = require('aws-sdk');
const cfnCR = require('cfn-custom-resource');
const recursiveReaddir = require('recursive-readdir');

const readFile = util.promisify(fs.readFile);
const s3 = new AWS.S3();

exports.handler = async message => {
  try {
    // List files in 'static' directory
    const files = await recursiveReaddir('static');

    // Upload files asynchronously to frontend content object store
    const promises = files.map(async file => s3.putObject({
      Bucket: process.env.BUCKET_NAME,
      Key: path.relative('static', file),
      Body: await readFile(file)
    }).promise());

    await Promise.all(promises);

    // Send success signal back to CloudFormation
    await cfnCR.sendSuccess('PopulateFrontendContent', {}, message);

    console.log('Succeeded in uploading site content!')
  } catch (err) {
    console.error('Failed to upload site content:');
    console.error(err);

    // Send error message back to CloudFormation
    await cfnCR.sendFailure(err.message, message);

    // Re-throw error to ensure invocation is marked as a failure
    throw err;
  }
};
