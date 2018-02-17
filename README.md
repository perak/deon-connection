# Deon Connection

[DeonDigital API](https://www.deondigital.com/) wrapper for [Meteor](https://www.meteor.com/)


## Package status

Experimental


## Install

```
meteor add perak:deon-connection
```


## Usage

In **server** scope:

```javascript

import { DeonConnection } from "meteor/perak:deon-connection";

global.DCON = new DeonConnection();

Meteor.startup(function() {

	DCON.connect({
		url: "http://localhost:8081",
		eventsUrl: "ws://localhost:8081/contractUpdates"
	});

	DCON.onContractUpdate(function(event) {
		console.log("Yay! We have an event!!!");
		console.log(event);
	});

});

```

And... that's it! Now your application is listening for events on websocket and you can send GET and POST requests to DeonDigital API.


## DeonConnection methods

### connect(options)

Connect to Deon API.

`options` is object with following members:

```
{
	url: "URL to Deon API root",
	eventsUrl: "URL to Deon's event stream websocket"
}
```


### onContractUpdate(callback)

Register callback which will fire when event is received from Deon API. Callback will be called with one argument `event` which is object.


### apiPost(url, data [, callback])

HTTP POST request to Deon API. If no callback is given then it executes synchroneously and returns response object. If you provide callback, it is called with two arguments: `error` (Meteor.Error object) and `response` (Object).


### apiGet(url [, callback])

HTTP GET request to Deon API. If no callback is given then it executes synchroneously and returns response object. If you provide callback, it is called with two arguments: `error` (Meteor.Error object) and `response` (Object).


## Example: deploy Smart Contract

In **server** scope (assuming you got `DCON` variable from previous example):

```javascript
Meteor.methods({
	"DeployContract": function(csl, templateName, contractName, entryPoint, peers) {

		var template = {
			name: templateName,
			csl: csl
		};

		var response = DCON.apiPost("/templates", template);

		var data = {
			name: contractName,
			templateId: response.id,
			templateExpressionArguments: [
			],
			entryPoint: entryPoint,
			peers: peers || []
		};

		var r = DCON.apiPost("/contracts", data);

		return r;

	}
});

```


Now, from **client** you can call:

```javascript
Meteor.call(
	"DeployContract",

	"contract Dummy() = success",
	"DummyTemplate",
	"DummyContract",
	"Dummy",
	[],

	function(err, res) {
		if(err) {
			alert(err);
		} else {
			alert("Yeah! It's deployed! " + res);
		}
	}
);
```


That's all folks,
Enjoy!
