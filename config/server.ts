export default {
  port: 8081,
  logger: true,
  loggerMode: "dev",
};

//  loggerModes
// “combined”: which gives you the Apache standard combined format for your logs.
// “common”: referencing the Apache standard common format.
// “dev”: A color-coded (by request status) log format.
// “short”: Shorter than the default format, including just the few items you’d expect a request logline would have.
// “tiny”: Even shorter, just the response time and a few extra items.
