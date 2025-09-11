require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*' }
});

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// attach io to req so controllers can emit if needed
app.use((req, res, next) => { req.io = io; next(); });

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/practitioners', require('./routes/practitioners'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/assignments', require('./routes/assignments'));

// new public therapies routes
app.use('/api/therapies', require('./routes/therapies'));

// feedback routes
app.use('/api/feedbacks', require('./routes/feedback'));

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.id;
        socket.role = payload.role;
        next();
    } catch (err) { next(); }
});

io.on('connection', (socket) => {
    console.log('socket connected', socket.id, 'user', socket.userId);
    if (socket.userId) socket.join(socket.userId.toString());
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
