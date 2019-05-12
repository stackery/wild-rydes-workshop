const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  await Promise.all(
    event.Records
      .map(record => JSON.parse(record['Sns']['Message']))
      .map(recordRide)
  );
};

async function recordRide(message) {
  await ddb.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      RideId: message.RideId,
      User: message.User,
      Unicorn: message.Unicorn,
      UnicornName: message.Unicorn.Name,
      RequestTime: message.RequestTime
    },
  }).promise();
}
