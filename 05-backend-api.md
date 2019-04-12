# Backend API
You'll now add the backend service for handling ride requests from Wild Rydes users. You'll create an API that will take requests from your frontend that will reserve a unicorn and direct it to your user's location. Your backend API will use API Gateway to handle HTTP requests plus a Lambda function to process the request. You'll also see the Stackery environment variables you previously configured.


## Instructions
1. Go back to the wild-rydes stack editor
    1. Use the back button or navigate to "Stacks" at the top of the Stackery dashboard, then select the "wild-rydes" stack
1. Add a Rest Api resource
    1. Modify the "Routes" setting so there is one route: POST /ride
    1. Check the "Enable CORS" setting
        * The default "CORS Access Control Headers" value is insufficient for our API. We need to allow the `Authorization` and `Content-Type` headers.
    1. To the right of the "CORS Access Control Headers" input box is a button with three dots. Click that and choose the YAML mode to enable fuller editing of the CORS configuration
    1. Put the following configuration into the text area:
        ```YAML
        AllowOrigin: '''*'''
        AllowHeaders: '''Authorization,Content-Type'''
        ```
    1. Save the settings
1. Add a Function resource to service api requests
    1. Update its "Logical ID" to `RequestUnicorn`
    1. Update its "Source Path" to `src/requestUnicorn`
    1. Add an environment variable for the Unicorn Stables™ api service
         1. Set the name to `UNICORN_STABLE_API`
         1. Click the button to the right of the value field that has three dots and select "Config"
               * This pulls the value from the Stackery environment configuration instead of specifying a static value
         1. Enter `unicornStableApi` (it should auto-complete for you as you type)
    1. Save the settings
    1. Drag a wire from the "POST /ride" api route to the RequestUnicorn Function
1. Add a Table resource for saving ride records
    1. Update the "Logical ID" to `Rides`
    1. Update the "Hash Key Name" to `RideId`
    1. Save the settings
    1. Drag a wire from the RequestUnicorn Function to the Rides Table.
        * This adds the `TABLE_NAME` environment variable so the function can access the table and adds permissions for the function to manipulate records
1. Add a Secrets resource to allow the RequestUnicorn Function to access the Unicorn Stables™ api key
    1. Drag a wire from the RequestUnicorn Function to the new Secrets resource
        * This adds a permission for the function to read secrets from AWS Secrets Manager under the environment namespace
        * It also adds an environment variable `SECRETS_NAMESPACE` to make it easier to locate the correct secrets for the environment the stack is deployed into
1. Drag a wire from the PopulateFrontendContent Function to the Api resource to add the `API_URL` environment variable to the function
    * The PopulateFrontendContent Function uses the environment variable to generate js/config.js as part of the website content
1. Authorize requests using the User Pool Client
    * Requests to POST /ride must have a valid User Pool authentication token in the `Authorization` header
    * Unfortunately, this is something that isn't nicely abstracted by AWS SAM yet, so we will manually edit the API resource settings
    1. Switch to the "Template" edit mode
    1. Locate the `Api` resource
    1. Add an `Auth` property with the following details:
        ```YAML
        Auth:
          Authorizers:
            WildRydes:
              UserPoolArn: !GetAtt UserPool.Arn
        ```
    1. Locate the POST /ride route under DefinitionBody -> paths -> /ride -> post
    1. Add the following `security` property
        ```YAML
        security:
          - WildRydes: []
        ```
    1. The complete `Api` resource definition look like (note that the order of the properties doesn't matter):
        ```YAML
        Api:
          Type: AWS::Serverless::Api
          Properties:
            Name: !Sub
              - ${ResourceName} From Stack ${StackTagName} Environment ${EnvironmentTagName}
              - ResourceName: Api
            StageName: !Ref EnvironmentAPIGatewayStageName
            Auth:
              Authorizers:
                WildRydes:
                  UserPoolArn: !GetAtt UserPool.Arn
            DefinitionBody:
              swagger: '2.0'
              info: {}
              paths:
                /ride:
                  post:
                    x-amazon-apigateway-integration:
                      httpMethod: POST
                      type: aws_proxy
                      uri: !Sub arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${RequestUnicorn.Arn}/invocations
                    responses: {}
                    security:
                      - WildRydes: []
            EndpointConfiguration: REGIONAL
            Cors:
              AllowHeaders: '''Authorization,Content-Type'''
              AllowOrigin: '''*'''
        ```
1. Commit the changes to the stack
1. Pull down the new changes using your favorite IDE / development tools
1. Copy [src/requestUnicorn/index.js](src/requestUnicorn/index.js) from this repository into your repository
    * The code handles requests, performing the following actions:
        1. Validates the User Pool Client authentication token (provided via the `Authorization` header) and retrieves the username from it
        1. Retrieves the Unicorn Stables™ api key from AWS Secrets Manager and caches the value for subsequent requests
        1. Makes a request to the Unicorn Stables™ endpoint to rent a unicorn
        1. Records the ride to the Rides DynamoDB table
        1. Returns with the response for the website request
1. Commit the code and push back up to the Git repository
1. Deploy again
1. Request a unicorn to be delivered to you!


