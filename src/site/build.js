const fs = require('fs');
const path = require('path');

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

// Write to public/js/config.js
const configPath = path.join('public', 'js', 'config.js');
fs.writeFileSync(configPath, configString);