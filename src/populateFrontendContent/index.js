const fs = require("fs");
const AWS = require("aws-sdk");
const cfnCR = require("cfn-custom-resource");
const recursiveReaddir = require('recursive-readdir');

const s3 = new AWS.S3();

exports.handler = async message => {
  try {
    // List files in 'static' directory
    const files = await recursiveReaddir('static');

    // Upload files asynchronously to frontend content object store
    const promises = files.map(async file => s3.putObject({
      Bucket: process.env.BUCKET_NAME,
      Key: file,
      Body: await fs.readFile(file)
    }));

    await Promise.all(promises);

    // Send success signal back to CloudFormation
    await cfnCR.sendSuccess('PopulateFrontendContent', {}, message);

    console.log('Succeeded in uploading site content!')
  } catch (err) {
    console.error('Failed to upload site content:');
    console.error(error);

    // Send error message back to CloudFormation
    await cfnCR.sendFailure(error.message, message);
  }
};
