const WebSocket = require("ws");
const Checksum = require("checksum");

export class DeonConnection {
	constructor(options = {}) {
		this.contractUpdateCallbacks = [];
		this.socketBroken = false;

		this._init(options);
	}

	_init(options = {}) {
		this.socket = null;

		this.options = {
			url: options ? options.url || "" : "",
			eventsUrl: options ? options.eventsUrl || "" : "",
		};
	}

	connect(options = {}, cb) {
		var self = this;

		if(options) {
			this._init(options);
		}

		if(!this.options.url) {
			let errorMsg = "ERROR: Deon API URL is not set.";
			if(cb) {
				cb(new Error(errorMsg));
			} else {
				console.log(errorMsg);
			}
		}

		if(this.options.eventsUrl) {
			this.listenEvents(cb);

			Meteor.setTimeout(() => {
				if(self.socketBroken) {
					console.log("Deon WebSocket connection is broken. Reconnecting...");
					self.listenEvents(cb);
				}
			}, 10);
		}
	}

	listenEvents(cb) {
		let self = this;

		this.socketBroken = false;

		try {
			this.socket = new WebSocket(this.options.eventsUrl);
		} catch(e) {
			if(cb) {
				cb(e);
			} else {
				console.log(e);
			}
			return;
		}

		this.socket.onmessage = Meteor.bindEnvironment((e) => {
			let event = {};
			try {
				event = JSON.parse(e.data);
			} catch(err) {
				if(cb) {
					cb(err);
				} else {
					console.log(err);
				}
				return;
			}

			let checksum = Checksum(JSON.stringify(event));
			if(!DeonLog.findOne({ checksum: checksum })) {
				DeonLog.insert({ checksum: checksum, event: event });

				self.contractUpdateCallbacks.map(function(updateCallback) {
					updateCallback(event);
				});
			}
		});

		this.socket.onopen = function(e) {
		};

		this.socket.onerror = function(e) {
			console.log("Deon WebSocket error. Type: \"" + e.type + "\".");
		};

		this.socket.onclose = function(e) {
			console.log("Deon WebSocket connection closed. Code: " + e.code + ", reason: \"" + e.reason + "\".", e.code, e.reason);
			if(e.code == 1000) {
				// normally closed
				return;
			}

			self.socketBroken = true;
		};
	}

	onContractUpdate(cb) {
		this.contractUpdateCallbacks.push(cb);
	}

	apiPost(url, data, cb) {
		if(!this.options.url) {
			var msg = "API URL is not configured.";
			if(cb) {
				cb(new Meteor.Error(400, msg));
			} else {
				console.error(msg);
			}
		}

		var apiUrl = this.options.url;
		if(!apiUrl) {
			var msg = "API URL is not configured.";
			if(cb) {
				cb(new Meteor.Error(400, msg));
			} else {
				console.error(msg);
			}
		}

		if(apiUrl[apiUrl.length - 1] != "/") {
			apiUrl += "/";
		}

		if(url && url[0] == "/") {
			url = url.substr(1);
		}

		var fullUrl = apiUrl + url;
		try {
			var result = HTTP.post(fullUrl, { headers: { "Content-Type": "application/json" }, data: data });
		} catch(e) {
			if(cb) {
				cb(e);
				return null;
			} else {
				console.error(e);
			}
		}

		if(cb) {
			cb(result);
		}
		return result;
	}

	apiGet(url, cb) {
		if(!this.options.url) {
			var msg = "API URL is not configured.";
			if(cb) {
				cb(new Meteor.Error(400, msg));
			} else {
				console.error(msg);
			}
		}

		var apiUrl = this.options.url;
		if(!apiUrl) {
			var msg = "API URL is not configured.";
			if(cb) {
				cb(new Meteor.Error(400, msg));
			} else {
				console.error(msg);
			}
		}

		if(apiUrl[apiUrl.length - 1] != "/") {
			apiUrl += "/";
		}

		if(url && url[0] == "/") {
			url = url.substr(1);
		}

		var fullUrl = apiUrl + url;
		var result = null;
		try {
			result = HTTP.get(fullUrl, null);
		} catch(e) {
			if(cb) {
				cb(e);
				return null;
			} else {
				console.error(e);
			}
		}

		if(cb) {
			cb(result);
		}
		return result;
	}
}
