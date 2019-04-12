# User Management
You’ll now add user management to Wild Rydes. By adding AWS Cognito support to the application you can manage user sign ups and handle application authentication and authorization. Once implimented, you’ll head back to your application, sign up, confirm your email, and login to the application.

## Instructions
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
1. Register as a new user
    1. Navigate to /register.html in your new website
    1. Register with your email address
    1. Retrieve a verification code from your email address and enter it in the verification screen


