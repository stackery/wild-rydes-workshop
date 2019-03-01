const randomBytes = require('crypto').randomBytes;
const get = require('https').get;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        if (!event.requestContext.authorizer) {
          return errorResponse('Authorization not configured', context.awsRequestId);
        }

        const rideId = toUrlString(randomBytes(16));
        console.log('Received event (', rideId, '): ', event);

        // Because we're using a Cognito User Pools authorizer, all of the claims
        // included in the authentication token are provided in the request context.
        // This includes the username as well as other attributes.
        const username = event.requestContext.authorizer.claims['cognito:username'];

        // The body field of the event in a proxy integration is a raw string.
        // In order to extract meaningful values, we need to first parse this string
        // into an object. A more robust implementation might inspect the Content-Type
        // header first and use a different parsing strategy based on that value.
        const requestBody = JSON.parse(event.body);

        const pickupLocation = requestBody.PickupLocation;

        const unicorn = await findUnicorn(pickupLocation);

        await recordRide(rideId, username, unicorn);

        // Because this Lambda function is called by an API Gateway proxy integration
        // the result object must use the following structure.
        return {
            statusCode: 201,
            body: JSON.stringify({
                RideId: rideId,
                Unicorn: unicorn,
                UnicornName: unicorn.Name,
                Eta: '30 seconds',
                Rider: username,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (err) {
        console.error(err);

        // If there is an error during processing, catch it and return
        // from the Lambda function successfully. Specify a 500 HTTP status
        // code and provide an error message in the body. This will provide a
        // more meaningful error response to the end client.
        return errorResponse(err.message, context.awsRequestId);
    };
};

// Get the unicorn stable API key from AWS Secrets Manager. Cache the value
// in `_apiKey` for subsequent invocations.
let _apiKey;
async function getUnicornStableApiKey() {
    if (!_apiKey) {
        if (!('SECRETS_NAMESPACE' in process.env)) {
            throw new Error('SECRETS_NAMESPACE environment variable is missing');
        }

        const secretsManager = new AWS.SecretsManager();

        // SECRETS_NAMESPACE is the namespace for this Stackery environment.
        // This function only has read permissions to secrets underneath this
        // namespace.
        const secretId = process.env.SECRETS_NAMESPACE + 'unicornStableApiKey';

        // Retrieve the secret value and store it in `_apiKey`
        ({ SecretString: _apiKey } = await secretsManager.getSecretValue({
            SecretId: secretId
        }).promise());
    }

    return _apiKey;
}

// This is where you would implement logic to find the optimal unicorn for
// this ride (possibly invoking another Lambda function as a microservice.)
// For simplicity, we'll just pick a unicorn at random.
async function findUnicorn(pickupLocation) {
    console.log('Finding unicorn for ', pickupLocation.Latitude, ', ', pickupLocation.Longitude);

    // Retrieve unicorn stable API key from AWS Secrets Manager
    const apiKey = await getUnicornStableApiKey();

    if (!('UNICORN_STABLE_API' in process.env)) {
        throw new Error('UNICORN_STABLE_API environment variable is missing');
    }

    // API may be like 'foo.example.com/path/prefix'. We would then need to make
    // a request to 'https://foo.example.com/path/prefix/unicorn'. This
    // calculates the hostname and full path for the request we need to make.
    const match = process.env.UNICORN_STABLE_API.match(/([^/]+)(\/.*)?/);

    if (!match) {
        throw new Error('Invalid unicorn stable API from UNICORN_STABLE_API environment variable');
    }

    const [ _, hostname, pathPrefix] = match;
    const path = (pathPrefix || '') + '/unicorn';

    console.log(`Making request to https://${hostname}${path}`);

    const options = {
        hostname,
        path,
        headers: {
            'x-api-key': apiKey
        }
    };

    return new Promise((resolve, reject) => {
        get(options, res => {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', data => body += data);

            res.on('end', () => resolve(JSON.parse(body)));

            res.on('error', err => reject(err));
        });
    });
}

function recordRide(rideId, username, unicorn) {
    return ddb.put({
        TableName: process.env.TABLE_NAME,
        Item: {
            RideId: rideId,
            User: username,
            Unicorn: unicorn,
            UnicornName: unicorn.Name,
            RequestTime: new Date().toISOString(),
        },
    }).promise();
}

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
}
