const { Server } = require("@hocuspocus/server");

// Initialize the server
const server = new Server({
  port: 1234,
  onConnect() {
    console.log("New connection established 🚀");
  },
  onDisconnect() {
    console.log("Connection closed 👋");
  },
});

// Start the server
server.listen().then(() => {
  console.log("✅ Hocuspocus WebSocket server is running on ws://localhost:1234");
});
