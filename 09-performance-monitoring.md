# Performance Monitoring
In this module, we will learn how to monitor the performance of our application and will also troubleshoot some Lambda-specific issues that can occur in your system.

## Instructions
### 1. Request 10 Unicorn rides
This will trigger our application.

### 2. Find the issue with the application
There is another issue with the application, let's find it!

Go to the [Transactions](https://platform.lumigo.io/transactions) page. Once again, toggle the `Transactions with issues only` button and hit `Filter`.

Looks like the `CalcSalaries` function has been timing out.

![](images/09-lumigo-transaction-issues.png)

Another way to quickly find issues in your system is to go to the [Issues](https://platform.lumigo.io/issues) page.

![](images/09-lumigo-issues.png)

We already dealt with the `TypeError` problem with the `UploadReceipt` function, so let's click on the `CalcSalaries` function to see why it's timing out.

This takes us to the function details page where we can see that it's got a fair few timeouts over the last few hours.

![](images/09-lumigo-calcsalaries-details.png)

Click on one of the transactions in the list (which is already filtered with the `TimedOut` error since we navigated here through the issues page) takes us to the [Transactions](https://platform.lumigo.io/transaction) view.

As you can tell from the logs on the right, it's been retried twice already, and all three attempts timed out after 6s.

![](images/09-lumigo-calcsalaries-transaction.png)

Click on the `Timeline` tab above the graph would tell us what happened.

Here we can see the timeline for all three invocations, and notice that there's a HTTP request to `http://hzi3xi7agi.execute-api.us-east-1.amazonaws.com/` which is marked as `N/A` for its duration?

This is how Lumigo represents an unfinished HTTP request because the function timed out.

![](images/09-lumigo-calcsalaries-timeline.png)

Click on that row to see more information about it, and you can see that the request to `https://hzi3xi7agi.execute-api.us-east-1.amazonaws.com/development/unicorn/Norman` never completed and that's why our function timed out (3 times!).

![](images/09-lumigo-calcsalaries-timedout.png)
