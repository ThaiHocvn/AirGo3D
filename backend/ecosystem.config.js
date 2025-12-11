module.exports = {
  apps: [
    {
      name: "Backend Service",
      script: "./build/server.js",
      instances: "1",
      exec_mode: "cluster",
      time: true
    }
  ]
}


