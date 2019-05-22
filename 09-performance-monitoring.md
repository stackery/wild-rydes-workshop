# Performance Monitoring
In this module, we will learn how to monitor the performance of our application
and will also troubleshoot some Lambda-specific issues that can occur in your
system.

# Instructions
### 1. Request 10 Unicorn rides
This will trigger our application.

### 2. Find the issue with the application
There is another issue with the application, lets find it! To do that, you can
use the alerts we set up in the previous module. You can also use the
[Event search](https://dashboard.epsagon.com/search).

<details>
<summary>Open to reveal the issue</summary>
The function CalcSalaries often times out. This is because the
/unicorn/{Name} endpoint of the stable API sometimes takes a long time to
complete (can you tell for which unicorn?)
When an API is performing poorly, it may impact our application costs. On
extreme cases, it may impact our customers experience as well (our poor
unicorns won't get their paycheck!)
A possible fix for this would be to extend the timeout of the function. A
better fix would be to troubleshoot the API, and understand why it is
performing poorly: Is it because of we are in a different region?
Does it have a temporary problem? Is there a better way to invoke it? (single
action vs. batch for example)
</details>