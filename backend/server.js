const express = require("express");
const cors = require("cors");
const http = require("http");
const redisConfig = require('./config/redis');
const { encode, decode } = require('@msgpack/msgpack');

require("dotenv").config();

const connectDB = require("./config/db");
const vehicleRoutes = require("./routes/vehicleRoutes");
const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");

const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use(
    "/api/vehicles",
    vehicleRoutes
);

app.get("/", (req, res) => {
    res.send("FleetDash Backend Running");
});


const server = http.createServer(app);

const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

const createDemoUser = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const demoUser = new User({
        email: 'manager@fleetdash.com',
        password: 'password123',
        role: 'Manager'
      });
      await demoUser.save();
      console.log('✅ Demo user created: manager@fleetdash.com / password123');
    }
  } catch (error) {
    console.error('Error creating demo user:', error.message);
  }
};

const startServer = async () => {
    // Check Redis status after a short delay
    setTimeout(() => {
        if (redisConfig.isRedisConnected()) {
            console.log('✅ Redis Connected');
            setupRedisListener();
        } else {
            console.log('⚠️  Redis disabled - running without cache');
        }
    }, 100);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });

    // Create demo user after DB is connected
    setTimeout(() => {
        createDemoUser();
    }, 1000);
};

const setupRedisListener = () => {
    try {
        const subscriber = redisConfig.redis.duplicate();
        
        subscriber.subscribe('vehicle:updates', (err, count) => {
            if (err) console.error('Subscribe error:', err);
            else console.log(`Subscribed to ${count} channel(s)`);
        });

        subscriber.on('message', (channel, message) => {
            if (channel === 'vehicle:updates') {
                try {
                    const data = JSON.parse(message);
                    const binaryData = encode(data);
                    io.emit('vehicleUpdateBinary', binaryData);
                } catch (err) {
                    console.error('Error processing Redis message:', err);
                }
            }
        });
    } catch (err) {
        console.error('Failed to setup Redis listener:', err.message);
    }
};

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => console.log('Client disconnected'));
});

startServer();
