Package.describe({
  name: "perak:deon-connection",
  version: "1.0.2",
  // Brief, one-line summary of the package.
  summary: "Deon API and event listener",
  // URL to the Git repository containing the source code for this package.
  git: "https://github.com/perak/deon-connection.git",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.6.1");
  api.use("ecmascript");

  api.use("mongo");

  api.addFiles("deon-log.js", ["client", "server" ]);

  api.mainModule("deon-connection.js");

  api.export("DeonConnection");
});

Package.onTest(function(api) {
  api.use("ecmascript");
  api.use("tinytest");
  api.use("perak:deon-connection");
  api.mainModule("deon-connection-tests.js");
});

Npm.depends({
    "ws": "4.0.0",
    "checksum": "0.1.1"
});
