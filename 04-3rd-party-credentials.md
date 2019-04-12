<!-- FIXME: Probably condense with previous step. -->
# Managing Third-Party Service Credentials
You'll now handle the management of the Unicorn Stables™ backend API keys. Similar to how we stored the backend API endpoint, we'll use Stackery environments, but we'll store the API key value in AWS Secrets Manager which gives us greater control over who can access the key. This is because unlike the Unicorn Stables™ backend API endpoint, API keys are considered sensitive. Should these credentials be leaked to the wrong person they could order unicorns we did not intend to order. This means we want to restrict access to them, even internally.


## Instructions
1. Open the "development" environment configuration view (if you're not already there)
    1. Navigate to "Environments" at the top of the Stackery dashboard
    1. Click on the "development" environment
1. Scroll to the "Environment Secrets" section at the bottom of the page
1. Add a new secret for the API key
    1. Click on "Add New Secret
    1. Enter `unicornStableApiKey` for the "Secret Name"
    1. Enter `AI9MFcqVQM7BtIIWeJvsy1U1hvWOykBoawqzqW2r` for the "Secret Value" (Oops! We shouldn't have committed the secret in this readme!)
    1. Click "Update" to save the secret under the /development/ namespace in the AWS account and region for this environment


