const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const cfnCR = require('cfn-custom-resource');
const mime = require('mime-types');
const recursiveReaddir = require('recursive-readdir');

const s3 = new AWS.S3();

exports.handler = async message => {
  try {
    await Promise.all([
      uploadStaticContent(),
      uploadConfig()
    ]);

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

// Upload site content from 'static' directory
async function uploadStaticContent() {
  // List files in 'static' directory except js/config.js.template
  const files = await recursiveReaddir('static', [ 'config.js.template' ]);

  // Upload files asynchronously to frontend content object store
  const promises = files.map(file => s3.putObject({
    Bucket: process.env.BUCKET_NAME,
    Key: path.relative('static', file),
    Body: fs.createReadStream(file),
    ContentType: mime.lookup(file) || 'application/octet-stream',
    ACL: 'public-read'
  }).promise());

  await Promise.all(promises);
}

// Build and upload config.js file
async function uploadConfig() {
  // Build config using API and Cognito User Pool info if we've deployed them
  const config = {
    api: {
      invokeUrl: process.env.API_URL ? `${process.env.API_URL}/ride` : undefined,
    },
    cognito: {
      userPoolId: process.env.USER_POOL_ID,
      userPoolClientId: process.env.USER_POOL_CLIENT_ID,
      region: process.env.AWS_REGION,
      disabled: !process.env.USER_POOL_CLIENT_ID
    }
  };

  // Make the content retrievable from global `_config` variable
  const configString = `window._config = ${JSON.stringify(config, null, 2)}`;

  // Upload to frontend content bucket
  await s3.putObject({
    Bucket: process.env.BUCKET_NAME,
    Key: 'js/config.js',
    Body: configString,
    ContentType: mime.lookup('config.js'),
    ACL: 'public-read'
  }).promise();
}
