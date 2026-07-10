const express = require("express");
const cors = require("cors");
const http = require("http");
const redis = require('./config/redis');
const { encode, decode } = require('@msgpack/msgpack');

require("dotenv").config();

const connectDB = require("./config/db");
const vehicleRoutes = require("./routes/vehicleRoutes");

const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use(
    "/api/vehicles",
    vehicleRoutes
);

app.get("/", (req, res) => {
    res.send("FleetDash Backend Running");
});


const server = http.createServer(app);

const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

// Redis subscriber
const subscriber = redis.duplicate();

subscriber.subscribe('vehicle:updates', (err, count) => {
    if (err) console.error('Subscribe error:', err);
    else console.log(`Subscribed to ${count} channel(s)`);
});

subscriber.on('message', (channel, message) => {
    if (channel === 'vehicle:updates') {
        const data = JSON.parse(message);
        // Option 1: send as JSON (fallback)
        // io.emit('vehicleUpdate', data);

        // Option 2: send as binary (ArrayBuffer) for reduced payload size
        const binaryData = encode(data);
        // Use a custom event 'vehicleUpdateBinary' that expects binary
        io.emit('vehicleUpdateBinary', binaryData);
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on ${PORT}`
    );
});