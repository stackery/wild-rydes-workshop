const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
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
      Unicorn: message.RideDetail.Unicorn,
      RequestTime: message.RequestTime
    },
  }).promise();
}
