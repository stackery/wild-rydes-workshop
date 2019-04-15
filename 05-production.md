# Production Deployment.
Now that we've provisioned a development version of the service, you will provision a production version. You'll repeat many of the previous steps you've just completed. When finished you'll have an entirely new production instance of Wild Rydes running along side your development instance.

## Instructions
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
    1. Click "Update" to save the secret under the /production/ namespace in the AWS account and region for this environment
1. Deploy the stack to the "production" environment
    1. Use the back button or navigate to "Stacks" at the top of the Stackery dashboard, then select the "wild-rydes" stack
    1. Navigate to the "Deploy" view in the sidebar at the left
    1. Prepare and deploy the stack in the "production" environment
1. Test requesting a unicorn in production (don't go crazy, remember real unicorns are super expensive!)
    * Find the FrontendContent website location from the deployment view

