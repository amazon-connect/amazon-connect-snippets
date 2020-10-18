var pingButton = $("#pingbutton");

function disablePingButton() {
  pingButton.attr("disabled", "disabled");
}

function enablePingButton() {
  pingButton.removeAttr("disabled");
}

function getURLParameter(name) {
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
  $("#pingbutton").click(pingButtonClicked);
  if (getURLParameter("run")) {
    $("#pingbutton").click();
  }
});

function pingButtonClicked() {
  disablePingButton();
  var latencyBoxes = $(".latency").toArray();
  latencyBoxes.reverse();
  doNextBox(latencyBoxes);
}

function doNextBox(latencyBoxes) {
  var box = latencyBoxes.pop();
  if (box) {
    var region = box.id;
    var endpoint = box.getAttribute("endpoint");
    step1_connect(box, region, endpoint, latencyBoxes);
  } else {
    enablePingButton();
  }
}

var imageCell = $("#imageCell");

function ping_endpoint(endpoint, onComplete) {
  var randomString = Math.floor(Math.random() * 0xffffffffffffffff).toString(36);
  var targetUrl = endpoint + "ping?x=" + randomString;
  imageCell.empty();
  imageCell.html("<img id='pingImage' style='display: none'>");
  var pingImage = $("#pingImage");
  pingImage.error(onComplete);
  pingImage.attr("src", targetUrl);
}

function step1_connect(box, region, endpoint, latencyBoxes) {
  $(box).html("connecting");
  ping_endpoint(endpoint, function () {
    step2_ping(box, region, endpoint, latencyBoxes);
  });
}

function currentTimeMillis() {
  return performance.now();
}

function step2_ping(box, region, endpoint, latencyBoxes) {
  $(box).html("pinging");
  var startTime = currentTimeMillis();
  ping_endpoint(endpoint, function () {
    step3_finish(startTime, box, region, endpoint, latencyBoxes);
  });
}

function step3_finish(startTime, box, region, endpoint, latencyBoxes) {
  var endTime = currentTimeMillis();
  var elapsed = Math.round(endTime - startTime);
  var color = "<font color='#1e8900'>";
  var intElapsed = Number(elapsed);
  if (intElapsed > 0 && intElapsed <= 200) {
    color = "<font color='#1e8900'>";
  }
  if (intElapsed > 200 && intElapsed <= 300) {
    color = "<font color='#ec7211'>";
  }
  if (intElapsed > 300 && intElapsed <= 400) {
    color = "<font color='#df3312'>";
  }
  if (intElapsed > 400) {
    color = "<font color='red'>";
  }

  var resultText = ".....  " + color + elapsed.toString() + " <font color='black'>ms ";
  $(box).html(resultText);
  doNextBox(latencyBoxes);
}
