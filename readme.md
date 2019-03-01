## Wyld Rides With Stackery

### Outline
#### Setup
1. Get an AWS account from organizers if you need one
1. [Create a Stackery account](https://stackery.io/sign-up)
1. Link Stackery to your AWS account
1. Link Stackery to GitHub, GitLab, or BitBucket for storing your source code
    * If you already have AWS CodeCommit set up in your own AWS account feel free to use it instead. We recommend using one of the other Git providers if you don't have AWS CodeCommit setup, though. CodeCommit requires extra steps to be able to checkout repositories.
1. Create a stack named 'wild-rydes' with a new repository using a blank stack template

#### Frontend Content
1. Add an "Object Store" resource (an AWS S3 Bucket) to serve the website content
    1. Double click the Object Store edit its settings
    1. Update the Logical ID value to be `FrontendContent`
    1. Enable Website Hosting (leave the default Index Document value of `index.html`)
    1. Save the settings
1. Add a Function resource (an AWS Lambda Function) to update the website content on every deployment
    1. Drag a wire from the Function to the FrontendContent Object Store
        * This adds environment variables (BUCKET_NAME, BUCKET_ARN) to the Function that can be used to access the bucket in the function source code
        * It also adds permissions to the Function so it can manipulate objects in the Object Store
    1. Double click the Function edit its settings
        1. Update the Logical ID value to be `PopulateFrontendContent`
        1. Update the Source Path value to be `src/populateFrontendContent`, this where Stackery will create a scaffold for the function code inside the Git repository
        1. Enable the Trigger On First Deploy setting
        1. Enable the Trigger On Every Deploy setting
        1. Save the settings
1. We need to do one thing to ensure everyone in the workshop doesn't try to create the same S3 Bucket name, as all S3 Bucket names are global:
    1. Switch from the "Visual" edit mode to the "Template" edit mode
    1. Find the FrontendContent resource and delete the `BucketName` property
    * CloudFormation generates a partially random name for the S3 Bucket when there is no `BucketName` property
1. Commit these changes
1. Clone the stack repository using your favorite IDE / development tools
1. Notice the repository has a scaffold for the PopulateFrontendContent function in `src/populateFrontendContent`
1. Copy [src/populateFrontendContent/index.js](src/populateFrontendContent/index.js) from this repository into your repository
    1. The code copies all the files in `src/populateFrontendContent/static/` into the FrontendContent Object Store
1. Copy [src/populateFrontendContent/package.json](src/populateFrontendContent/package.json) from this repository into your repository
    1. This file lists package dependencies of the populateFrontendContent function
1. Copy the contents of [src/populateFrontendContent/static](src/populateFrontendContent/static) into your repository
    * TODO: Make this a zipball people can download and extract into the function?
1. Commit the new code and push it back up to the git repository
1. Deploy the stack
    1. In Stackery, switch to the "Deploy" view in the left sidebar
    1. Prepare a deployment for the "development" environment from the `master` branch
    1. Once the preparation completes (this should take about 20 seconds), click the "Deploy" button to open CloudFormation
    1. Click the "Execute" button in the CloudFormation Console to provision the S3 Bucket and Lambda Function
1. View the website
    1. Once the deployment is complete, switch to the "View" view in the left sidebar of Stackery
    1. Double-click the FrontendContent Object Store resource to view its details
    1. Click on the "Website Hosting Address" link to open the website
    * The website should appear, though it's missing resources it needs to be fully functional

#### User Management
1. Back in the Stackery Visual edit mode, add a User Pool resource
    1. Enable the "Auto-Verify Emails" setting
    1. Save the settings
1. Add a User Pool Client resource
    1. Drag a wire from the User Pool Client resource to the User Pool resource
    * User Pool Clients are used to generate authentication tokens for users
1. Configure the website content to authenticate users using the new User Pool
    1. Drag a wire from the PopulateFrontendContent Function to the new User Pool resource
        * This adds an environment variable `USER_POOL_ID` to the Function
    1. Drag a wire from the PopulateFrontendContent Function to the new User Pool Client resource
        * This adds an environment variable `USER_POOL_CLIENT_ID` to the Function
    1. The PopulateFrontendContent Function uses these environment variables to generate js/config.js as part of the website content
1. Deploy the stack again
1. Register as a new user (Chase: I think this should work without having the backend API set up, but can't remember. We can fix this if it doesn't work.)
    1. Navigate to /register in your new website
    1. Register with your email address
    1. Retrieve a verification code from your email address and enter it in the verification screen

#### Environment Parameters
We will provision a backend api for requesting unicorns sent to users on demand. The api will rent unicorns from a third part Unicorn Stables™ service. Understandably, it's extremely expensive to rent unicorns, so thankfully they provide a staging api in addition to their production api. We'll use the staging api for now.

The staging and production Unicorn Stables™ services have different endpoints. We need to use the right endpoint for the right environment of our stack. We'll use Stackery environments to parameterize the endpoints.

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

#### Managing Third-Party Service Credentials
The Unicorn Stables™ service requires API keys. These are very confidential (we certainly don't want people charging unicorn rentals to our account!), so we need a secure place to store them. Let's use Stackery environments to store the API key in AWS Secrets Manager.

1. Open the "development" environment configuration view (if you're not already there)
    1. Navigate to "Environments" at the top of the Stackery dashboard
    1. Click on the "development" environment
1. Scroll to the "Environment Secrets" section at the bottom of the page
1. Add a new secret for the API key
    1. Click on "Add New Secret
    1. Enter `unicornStableApiKey` for the "Secret Name"
    1. Enter `AI9MFcqVQM7BtIIWeJvsy1U1hvWOykBoawqzqW2r` for the "Secret Value" (Oops! We shouldn't have committed the secret in this readme!)
    1. Click "Update" to save the secret under the "development" namespace in the AWS account and region for this environment

#### Backend Api
Now that we have configured access to the Unicorn Stables™ service we now need to create our own api to take user requests to have a unicorn delivered to their location and fulfill that request via a rental from Unicorn Stables™.

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

#### Production Service
Now that we've provisioned a "development" version of the service, now let's provision a "production" version.

1. Create a "production" environment
    1. Navigate to the Environments view at the top of the dashboard screen.
    1. Click the "Add an Environment" button
    1. Name the environment `production`
        * Feel free to change the AWS Account (if you've linked multiple accounts) or region to your liking
    1. Click "Create"
1. Navigate to the "production" environment
1. Add a new property named `unicornStableApi` with the production Unicorn Stables™ endpoint `6k83qcdlb1.execute-api.us-east-1.amazonaws.com/development`
    1. The parameters should look like the following when complete:
        ```JSON
        {
          "unicornStableApi": "6k83qcdlb1.execute-api.us-east-1.amazonaws.com/development"
        }
        ```
    1. Click the "Save" button at the top of the sidebar on the left
1. Scroll to the "Environment Secrets" section at the bottom of the page
1. Add a new secret for the API key
    1. Click on "Add New Secret
    1. Enter `unicornStableApiKey` for the "Secret Name"
    1. Enter `R7jeufY43d5sB9HYBNCKJ3N7pCjqFm7aNF9KxHF3` for the "Secret Value" (Oops! We committed the secret to this readme again!)
    1. Click "Update" to save the secret under the "development" namespace in the AWS account and region for this environment
1. Deploy the stack to the "production" environment
    1. Use the back button or navigate to "Stacks" at the top of the Stackery dashboard, then select the "wild-rydes" stack
    1. Navigate to the "Deploy" view in the sidebar at the left
    1. Prepare and deploy the stack in the "production" environment
1. Test requesting a unicorn in production (don't go crazy, remember real unicorns are super expensive!)
    * Find the FrontendContent website location from the deployment view
