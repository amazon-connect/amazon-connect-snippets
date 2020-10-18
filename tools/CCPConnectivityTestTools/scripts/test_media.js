var request_no = 1;
var success = new Object();

var all_regions = {
  'US-East-1': {
    'mediaBlocks': [
      {
        'startIp': '52.55.191.224',
        'ipsInBlock': '8'
      },
	  {
        'startIp': '18.233.213.128',
        'ipsInBlock': '8'
      }
    ]
  },
    'US-West-2': {
    'mediaBlocks': [
      {
        'startIp':'54.190.198.32',
        'ipsInBlock': '8'
      },
	  {
        'startIp':'18.236.61.0',
        'ipsInBlock': '8'
      }
    ]
  },
  'Sydney': {
    'mediaBlocks': [
      {
        'startIp': '13.210.2.192',
        'ipsInBlock': '8'
      },
      {
        'startIp': '13.236.8.0',
        'ipsInBlock': '8'
      }

    ]
  },
  'Frankfurt': {
    'mediaBlocks': [
      {
        'startIp': '18.184.2.128',
        'ipsInBlock': '8'
      },
      {
        'startIp': '35.158.127.64',
        'ipsInBlock': '8'
      }
    ]
  },
  'Tokyo': {
    'mediaBlocks': [
      {
        'startIp': '18.182.96.64',
        'ipsInBlock': '8'
      }
    ]
  },
  'Singapore': {
    'mediaBlocks': [
      {
        'startIp': '15.193.0.0',
        'ipsInBlock': '8'
      }
    ]
  },
  'London': {
    'mediaBlocks': [
      {
        'startIp': '15.193.0.0',
        'ipsInBlock': '8'
      }
    ]
  }
}

function checkTURNServer(region, turnConfig, timeout) {
  request_no++;
  return new Promise(function (resolve, reject) {

    setTimeout(function () {
      if (promiseResolved) return;
      resolve(false);
      promiseResolved = true;
    }, timeout || 5000);

    var promiseResolved = false
      , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
      , pc = new myPeerConnection({ iceServers: [turnConfig] })
      , noop = function () { };
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(function (sdp) {
      if (sdp.sdp.indexOf('typ relay') > -1) { // sometimes sdp contains the ice candidates...
        promiseResolved = true;
        resolve(true);
      }
      pc.setLocalDescription(sdp, noop, noop);
    }, noop);    // create offer and set local description
    pc.onicecandidate = function (ice) {  //listen for candidate events
      var ipRe = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

      try
	  {
		testIp = ice.candidate.candidate.match(ipRe);
		if (isRfc1918(testIp))
		{
			if (! success.hasOwnProperty(region) ){
			  printToDisplay("[" + region + "]  ..........  <font color='green'>Success</font>", region);
			  success[region] = "PASSED";
			  console.log ("PASS for region: " + region + " and ip: " + testIp);
			}
		}
		if (promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay') > -1)) return;

		promiseResolved = true;
		resolve(true);
	  }
	  catch {}
    };
  });
}

function isRfc1918(ipIn){
  var ipToTest = new String(ipIn);
  var rfc1918_1_re = /^10\..*$/;
  var rfc1918_2_re = /^172\.(16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31).*$/;
  var rfc1918_3_re = /^192\.168\..*$/;

  if ( ipToTest.match(rfc1918_1_re) ){
    return false;
  } else if ( ipToTest.match(rfc1918_2_re) ) {
    return false;
  } else if ( ipToTest.match(rfc1918_3_re) ) {
    return false;
  } else {
    return true;
  }
}

function printToDisplay(message, region) {

	var docTarget = "";
	switch(region) {
	  case "US-East-1":
			docTarget = "media-us-east-1";
		break;
	  case "US-West-2":
			docTarget = "media-us-west-2";
		break;
		  case "Sydney":
			docTarget = "media-ap-southeast-2";
		break;
		  case "Frankfurt":
			docTarget = "media-eu-central-1";
		break;
		  case "Tokyo":
			docTarget = "media-ap-northeast-1";
		break;
		  case "Singapore":
			docTarget = "media-ap-southeast-1";
		break;
		  case "London":
			docTarget = "media-eu-west-2";
		break;
	  default:
		// code block
	}

	console.log ("region: " + region + " and docTarget: " + docTarget);
	console.log(document.getElementById(docTarget).innerHTML);
	if (document.getElementById(docTarget).innerHTML.includes("FAIL"))
	{
		console.log("previous failure detected. Not marking success.");
		document.getElementById(docTarget).innerHTML = "<font color='red'> ..... FAILED UDP 3478</font>";
	}
	else
	{
		console.log("previous failure not detected. Marking success.");
		document.getElementById(docTarget).innerHTML = "<font color='green'> ..... PASSED</font>";
	}
}

function test_turn(region, turn_url, user, cred) {
  checkTURNServer(region, {
    urls: turn_url,
    username: user,
    credential: cred
  }, 1000).then(function (bool) {
    var active = bool ? 'yes' : 'no';
  }).catch(console.error.bind(console));
}

function iterate_through_array(region, startIp, ipsInBlock){

  console.log("Checking region " + region + " and startIp: " + startIp);
  var octets = startIp.split(".");
  var first = octets[0];
  var second = octets[1];
  var third = octets[2];
  var fourth = octets[3];
  var endOctet = Number(fourth) + Number(ipsInBlock);


  for ( var lastOctet = Number(fourth); (lastOctet <= Number(fourth) + Number(ipsInBlock)) && (lastOctet <= 255); lastOctet++){
    var ipToTest = first + "." + second + "." + third + "." + lastOctet
    test_turn(region, "stun:" + ipToTest + ":3478","test","test");
  }
}

function printFailure() {
  for (var region in all_regions) {
	console.log("printFailure called for region: " + region);
  if (!success.hasOwnProperty(region) ){
	  console.log("hasOwnProperty for region " + region + ", result: " +  success.hasOwnProperty(region));
	var docTarget = "";
	switch(region) {
	  case "US-East-1":
			docTarget = "media-us-east-1";
		break;
	  case "US-West-2":
			docTarget = "media-us-west-2";
		break;
		  case "Sydney":
			docTarget = "media-ap-southeast-2";
		break;
		  case "Frankfurt":
			docTarget = "media-eu-central-1";
		break;
		  case "Tokyo":
			docTarget = "media-ap-northeast-1";
		break;
		  case "Singapore":
			docTarget = "media-ap-southeast-1";
		break;
		  case "London":
			docTarget = "media-eu-west-2";
		break;
	  default:
		// code block
	}

	console.log("Success not found for region: " + region + ", marking failure");
	document.getElementById(docTarget).innerHTML = "<font color='red'> ..... FAILED UDP 3478</font>";
  }
}
}

function test_all_regions() {
  for (var region in all_regions) {
    for (var key in all_regions[region]) {
      for (var arrayindex = 0; arrayindex < all_regions[region][key].length; arrayindex++) {
        thisStartIp = all_regions[region][key][arrayindex].startIp
        thisIpsInBlock = all_regions[region][key][arrayindex].ipsInBlock
        iterate_through_array(region, thisStartIp, thisIpsInBlock);
      }
    }
  }
  setTimeout(printFailure,5000);
}
