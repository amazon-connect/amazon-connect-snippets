var element = document.querySelector('form');

element.addEventListener('submit', event => {
  event.preventDefault();
});

var pingButtonCF = $("#pingbuttonCF");

function disablePingButtonCF() {
  pingButtonCF.attr("disabled", "disabled");
}

function enablePingButtonCF() {
  pingButtonCF.removeAttr("disabled");
}

function getURLParameterCF(name) {
  var regex = new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)");
  var matches = regex.exec(location.search);
  if (matches == null) {
    return null;
  }
  var value = matches[1];
  var value = value.replace(/\+/g, "%20");
  return decodeURIComponent(value);
}

$(document).ready(function () {
  $("#pingbuttonCF").click(pingButtonClickedCF);
  if (getURLParameterCF("run")) {
    $("#pingbuttonCF").click();
  }
});

function doNextBoxCF(latencyBoxes) {
  var box = latencyBoxes.pop();
  if (box) {
    var region = box.id;
    const alias = $.trim($("#alias").val());
    var endpoint = "https://" + alias + ".awsapps.com/";
    step1_connectCF(box, region, endpoint, latencyBoxes);
  }
}

function pingButtonClickedCF(e) {
  e.preventDefault();
  disablePingButtonCF();
  var latencyBoxesCF = $(".latencyCF").toArray();
  latencyBoxesCF.reverse();
  doNextBoxCF(latencyBoxesCF);
}

var imageCellCF = $("#imageCellCF");

function ping_endpointCF(endpoint, onComplete) {
  console.log("ping function called with endpoint: " + endpoint);
  var randomString = Math.floor(Math.random() * 0xffffffffffffffff).toString(36);
  var targetUrl = endpoint + "css/ajax-loader.gif?x=" + randomString;
  imageCellCF.empty();
  imageCellCF.html("<img id='pingImageCF' style='display: none'>");
  var pingImage = $("#pingImageCF");
  pingImage.error(onErrorHandler);
  pingImage.load((item) => {
    console.log("ready!", item);
    onComplete(item);
  });
  pingImage.attr("src", targetUrl);
}

function onErrorHandler(err) {
  console.log(err);
  $("#Cloudfront").html("<span>Error in reaching to CloudFront endpoint. Please verify if the Instance Alias is correct.</span>");
  enablePingButtonCF();
}

function step1_connectCF(box, region, endpoint, latencyBoxes) {
  $(box).html("connecting");
  console.log("connecting at the beginning to " + endpoint);
  ping_endpointCF(endpoint, function () {
    step2_pingCF(box, region, endpoint, latencyBoxes);
  });
}

function currentTimeMillisCF() {
  return performance.now();
}

function step2_pingCF(box, region, endpoint, latencyBoxes) {
  $(box).html("pinging");
  var startTime = currentTimeMillisCF();
  console.log("pinging now...");
  ping_endpointCF(endpoint, function () {
    step3_finishCF(startTime, box, region, endpoint, latencyBoxes);
  });
}

function step3_finishCF(startTime, box, region, endpoint, latencyBoxes) {
  var endTime = currentTimeMillisCF();
  var elapsed = Math.round(endTime - startTime);
  var color = "<font color='green'>";
  var intElapsed = Number(elapsed);
  console.log("elapsed time: " + intElapsed);

  if (intElapsed > 0 && intElapsed <= 200) {
    color = "<font color='green'>";
  }
  if (intElapsed > 200 && intElapsed <= 300) {
    color = "<font color='yellow'>";
  }
  if (intElapsed > 300 && intElapsed <= 400) {
    color = "<font color='orange'>";
  }
  if (intElapsed > 400) {
    color = "<font color='red'>";
  }

  var resultText = ".....  " + color + elapsed.toString() + " <font color='black'>ms ";
  $(box).html(resultText);
  enablePingButtonCF();
}
