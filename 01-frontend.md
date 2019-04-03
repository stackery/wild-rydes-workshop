# Frontend Content
In this step of the workshop you will create and deploy the Wild Rydes frontend. The frontend is composed of an AWS S3 bucket and a Lambda function that is triggered on deployment which will populate the S3 bucket with the Wild Rydes static content.

## Instructions

### 1. Add an Object Store resource
Add an "Object Store" resource (an AWS S3 Bucket) to serve the website content. Click the **Add Resource** button in the top right of screen to reveal the resources menu. Then click on the *Object Store* resource. This will add the Object Store resource to the canvas.

![Add Object Store](./images/01-object-store.png)

Next, double-click on the object store to edit it's settings. Set the **CLOUDFORMATION LOGICAL ID** fields to `FrontendContent`. Then click **ENABLE WEBSITE HOSTING** and leave the value of **INDEX DOCUMENT** as `index.html`. Finally save the Settings.

<!-- FIXME: Cloudformation Logica ID is wrong-->
![Configure Object Store](./images/01-object-store-config.png)

AWS S3 bucket names must be globally unique, no two accounts can have a bucket with the same name. Because of this you need to explicitly name your bucket so it doesn't conflict with others in this workshop. Start by changing from the *Visual* **EDIT MODE** by clicking on *Template* in the upper left. This will change away from the visual canvas to the raw stack YAML.

<!-- FIXME: IMAGE -->

<!-- FIXME: remove once Stackery pushes out change to add AWS::AccountId automatically
Find the *FrontendContent* resource (you can use Ctrl+F to search for it) and append `${AWS::AccountId}` to the existing **BucketName** value. Once you've done that, click the **Commit** button and then click the **Commit and Push** button.

Old resource:

```yaml
FrontendContent:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub ${AWS::StackName}-frontendcontent
```

New resource:

```yaml
FrontendContent:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub ${AWS::StackName}-frontendcontent-${AWS::AccountId}
```
-->

### 2. Add a Function resource
Add a Function resource (an AWS Lambda Function) to update the website's static content. This function will copy the contents of a directory in the project source code to the Object Store we've just configured. You will also configure this Function resource to be triggered on every deployment of the stack.

From the *Add Resources* menu (found buy clicking *Add Resource*), click a Function resource to add it to the stack.

<!-- FIXME: IMAGE -->

Next drag a wire from the Function to the *FrontendContent* Object Store. **Make sure to drag the wire from the right end of the Function resource and connect it to the left end of the Object Store resource**. The line you are dragging should be a dotted line and not a solid line if you've done this correctly. This distinction is necessary because we want to indicate that the Function resource needs permissions to access the Object Store resource, not that the Object Store resource is an event trigger for the function.

<!-- FIXME: IMAGE -->

To tell if you've drawn the relationship correctly, double-click on the Function resource and scroll down to **ENVIRONMENT VARIABLES**. You should see the variables `BUCKET_NAME` and `BUCKET_ARN` defined.

Next in the Function's settings, set the **LOGICAL ID** field enter the value `PopulateFrontendContent`. Then update the **SOURCE PATH** field to `src/populateFrontendContent`. This path is where Stackery will create a scaffold for the function code inside the Git repository.


Scroll further down in the settings and check off **TRIGGER ON FIRST DEPLOY** and **TRIGGER ON EVERY DEPLOY**. This will create an [AWS CloudFormation CustomResource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html) in the stack that will the function on deployments and updates. After you've done this, click the **Save** Button.

<!-- FIXME: IMAGE -->


### 3. Clone the application repository and workshop locally

Clone your application repository using Git via the command line or favorite IDE / development tools to your computer. You will now locally edit the code of the _populateFrontendContent_ function. In the upper left of your screen underneath the stack name is a link to your code repository. Click the link to navigate to it and follow the GitHub instructions for cloning it to your computer.

<!-- FIXME: IMAGE -->

If you browse the contents of the project directory you will notice the repository has a scaffold for the _PopulateFrontendContent_ Function reslource in _src/populateFrontendContent_
```
$ tree wild-rydes
wild-rydes
├── src
│   └── populateFrontendContent
│       ├── README.md
│       └── index.js
└── template.yaml
```

Next clone this workshop to your computer. You will be copying the code from the workshop repository into your own application stack.

<!-- FIXME: Perhaps we change the stackery repo name? -->
```
git clone https://github.com/stackery/wild-rydes.git workshop-wild-rydes
```

Copy the following files and directories from the workshop to your application stack's directory.

* *src/populateFrontendContent/index.js*
* *src/populateFrontendContent/package.json*
* *src/populateFrontendContent/static/*

You can do this by running the following commands on Linux or Macos.

```
$ cp workshop-wild-rydes/src/populateFrontendContent/index.js wild-rydes/src/populateFrontendContent
$ cp workshop-wild-rydes/src/populateFrontendContent/package.json wild-rydes/src/populateFrontendContent
$ cp -R workshop-wild-rydes/src/populateFrontendContent/static wild-rydes/src/populateFrontendContent
```

Finally, commit the new code and push it back up to your git repository.

```
$ cd wild-rydes
$ git add src/populateFrontendContent
$ git commit -m "Add populateFrontendContent function"
$ git push
```

### 4. Deploy the stack
You'll now deploy the *wild-rydes* stack to AWS. Stackery will package your code repository and deploy it using AWS CloudFormation.

In Stackery click **Deploy** view in the left sidebar to enter the Deploy view. Next click **Prepare new deployment** for the **development** environment. For the **branch or SHA** value enter `master` and then click **Prepare Deployment**.
<!-- FIXME: IMAGE -->

Once the preparation completes (this should take about 20 seconds), click the **Deploy** button to open CloudFormation. Then click the **Execute** button in the CloudFormation Console to provision the Object Store (S3 Bucket) and Function (Lambda) resources.
<!-- FIXME: IMAGE -->

<!-- FIXME: IMAGE -->

### 5. View the website
Now you can visit your Wild Rydes website that you have deployed.

Once the deployment is complete, switch to the **View** view in the left sidebar of Stackery. Double-click the *FrontendContent* Object Store resource to view its details. On the details page click on the **Website Hosting Address** link to open the website.

<!-- FIXME: IMAGE -->

The website should appear, though it's missing resources it needs to be fully functional
<!-- FIXME: IMAGE -->

