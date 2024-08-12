const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");
const app = express();

const server = http.createServer(app);
const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
    console.log(`User connected: ${socket.id}`);

    socket.on("send-location", function(data) {
        console.log(`Received location from ${socket.id}:`, data);
        io.emit("recieve-location", { id: socket.id, ...data }); // Broadcasting location data
    });

    socket.on("disconnect", function() {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id); // Notify clients of the disconnection
    });
});


app.get("/", function(req, res) {
    res.render("index");
});

server.listen(5000);
