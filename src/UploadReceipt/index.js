const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  await Promise.all(
    event.Records
      .map(record => JSON.parse(record['Sns']['Message']))
      .map(uploadReceipt)
  );
};

function uploadReceipt(message) {
  console.log(`uploading receipt for message ${JSON.stringify(message)}`);
  return s3.putObject({
    Bucket: process.env.BUCKET_NAME,
    Key: `${message.RideId}`,
    Tagging: `email=${message.Email}&time=${message.RequestTime}&subject=Receipt%20For%20Unicorn%20Ride`,
    Body: (
`
Receipet for ride ${message.RideId}:
-----------------------------------
Rider: ${message.user}
Unicorn: ${message.UnicornName}
Time: ${message.RequestTime}
Price: 0 USD

Had a good ride? don't forget to rate us in the app store!
`
    )
  }).promise();
}
