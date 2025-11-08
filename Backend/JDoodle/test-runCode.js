const https = require("https");

const data = JSON.stringify({
  script: 'x=2; y=3; print(x+y)',
  language: "python3",
  versionIndex: "3",
  clientId: "158d1e8efe8cff5172d85092e5e8819d",
  clientSecret: "1bf9dd7a0cd6e0fbe40f69fb9817ee10e8e9da0a70c068ad12195aa8a12f43b7",
});

const options = {
  hostname: "api.jdoodle.com",
  path: "/v1/execute",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => console.log("Output:", JSON.parse(body).output));
});

req.on("error", (err) => console.error("Error:", err));
req.write(data);
req.end();