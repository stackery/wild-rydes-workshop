# Environment Parameters
You will provision a backend API for requesting unicorns sent to users on demand. The API will rent unicorns from a third party Unicorn Stables™ service. The service provides both development and production API endpoints and your function will need to know the correct value depending on whether it's the development or production deployment of the application.

Through the use of Stackery environments, you will define the API endpoint for the development service. When you get to creating the Wild Rydes backend API service you will configure a Lambda function environmental variable that will use this value.

## Instructions
1. Open the "development" environment configuration view
    1. Navigate to "Environments" at the top of the Stackery dashboard
    1. Click on the "development" environment
1. Add a new parameter to the "Environment Parameters"
    1. Stackery environment parameters are configured as JSON
    1. Add a new property named `unicornStableApi` with the staging Unicorn Stables™ endpoint `hzi3xi7agi.execute-api.us-east-1.amazonaws.com/development`
    * The parameters should look like the following when complete:
        ```JSON
        {
          "unicornStableApi": "hzi3xi7agi.execute-api.us-east-1.amazonaws.com/development"
        }
        ```
1. Click the "Save" button at the top of the sidebar on the left


