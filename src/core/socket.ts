import socket from "socket.io";
import http from "http";

export default (http: http.Server): socket.Namespace => {
    const io = socket(http);

    return io.on("connection", function(socket: socket.Server) {
        console.log('connect');
        socket.on('disconnect', function () {
        console.log('A user disconnected');
        });
    });


    // return io;
};