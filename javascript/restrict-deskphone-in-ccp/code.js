//Enter your Connect instance ID in the below line
var ccpUrl = "https://XXXXXX.awsapps.com/connect/ccp-v2#";

connect.core.initCCP(containerDiv, {
    ccpUrl: ccpUrl,
    loginPopup: true,
    softphone: {
        allowFramedSoftphone: true
    }
});

//Code for disabling Deskphone via  streams API
connect.agent(function(agent){
 agent.onRefresh(handleAgentRefresh);
});

//Function to handle the event and check for deskphone settings
function handleAgentRefresh(agent) {
  var config = agent.getConfiguration();
  var x = config.softphoneEnabled;
  if (x === false) {
    config.extension = "";
    config.softphoneEnabled = true;
    agent.setConfiguration(config, {
      success: function() {browserNotify("You are not authorised to change to Deskphone. Softphone enabled again");},
      failure: function(err) {browserNotify("You are not authorised to change to Deskphone. Please revert back to the Softphone again");}
    });
  }
};

//Function to raise the browser notification, if supported
function browserNotify(msg) {
 console.log("Notification called");
 // Let's check if the browser supports notifications
 if (!("Notification" in window)) {
   console.log("Notifications not working");
   alert(msg.toString());
 }

 // Let's check whether notification permissions have already been granted
 else if (Notification.permission === "granted") {
   // If it's okay let's create a notification
   var notification = new Notification(msg.toString());
 }

 // Otherwise, we need to ask the user for permission
 else if (Notification.permission !== "denied") {
   Notification.requestPermission().then(function (permission) {
     // If the user accepts, let's create a notification
     if (permission === "granted") {
       var notification = new Notification(msg.toString());
     }
     else {
       alert(msg.toString());
     }
   });
 }
}
//Code End
