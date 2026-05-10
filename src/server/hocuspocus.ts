import {
    Server,
    onConnectPayload,
    onDisconnectPayload,
} from "@hocuspocus/server";

const server = new Server({
    port: 1234,

    async onConnect(data: onConnectPayload) {
        console.log("Client connected", data);
    },

    async onDisconnect(data: onDisconnectPayload) {
        console.log("Client disconnected", data);
    },
});

server.listen();