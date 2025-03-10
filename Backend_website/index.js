const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
require('express-async-errors');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./config/logger');
const loggingMiddleware = require('./middlewares/logging');
const errorHandler = require('./middlewares/errorHandler.cjs');
const emailService = require('./services/emailService');
const passport = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimit');
const routes = require('./routes');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const Message = require('./models/Message');
const courseRoutes = require('./routes/courseRoutes');
const morgan = require('morgan');
const discussionRoutes = require('./routes/discussionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dotenv = require('dotenv');

const app = express(); // Move app initialization here

// Load environment-specific configuration
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './.env.production' });
} else {
  dotenv.config({ path: './.env.development' });
}

config.mongoose = {
  url: process.env.NODE_ENV === 'production' ? process.env.MONGODB_URL_PROD : process.env.MONGODB_URL_DEV,
  options: { useNewUrlParser: true, useUnifiedTopology: true }
};

config.port = process.env.PORT || 1337;

if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth', authLimiter);
}

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
    await emailService.initializeEmailService();
    logger.info('Email service initialized');

    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
  }
};

startServer();

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  process.exit(0);
});

const server = http.createServer(app); // Combined server for Express and Socket.IO
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3000", "https://o-dots.com"],
    methods: ["GET", "POST"],
  },
});

app.use(morgan('dev'));
app.use(loggingMiddleware);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options('*', cors());
app.use(passport.initialize());

app.use(cors({
  origin: ['https://o-dots.com','https://www.o-dots.com', 'http://localhost:3000' ],// Your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (req, res) => {
  res.send('Welcome to O-dots!');
});

app.use('/api', routes);
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api/posts', postRoutes);
app.use('/discussions', discussionRoutes); 
app.use('/messages', messageRoutes); 
app.use('/payments', paymentRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api/search', searchRoutes);
app.use('/search', searchRoutes);

app.use(express.static(path.join(__dirname, 'path_to_nuxt_dist_folder')));
app.use(errorHandler);

// Search functionality
app.get('/search', async (req, res) => {
  const keyword = req.query.keyword.toLowerCase();
  const includeCollections = ['discussions', 'messages', 'posts', 'products'];

  try {
    let collections = await mongoose.connection.db.listCollections().toArray();
    collections = collections.map(col => col.name).filter(col => includeCollections.includes(col));

    const searchPromises = collections.map(collection => {
      return mongoose.connection.db.collection(collection)
        .find({
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { content: { $regex: keyword, $options: 'i' } }
          ]
        })
        .toArray();
    });

    const results = (await Promise.all(searchPromises)).flat();
    res.json(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (discussionId) => {
    console.log(`User joined room: ${discussionId}`);
    socket.join(discussionId);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const existingMessage = await Message.findOne({
        text: data.text,
        sender: data.sender,
        discussionId: data.discussionId,
        timestamp: data.timestamp
      });

      if (existingMessage) {
        console.log('Duplicate message detected, not saving:', existingMessage);
        return;
      }

      const newMessage = new Message({
        text: data.text,
        sender: data.sender,
        senderShow: data.senderShow,
        discussionId: data.discussionId,
        timestamp: data.timestamp,
      });

      const savedMessage = await newMessage.save();
      io.to(data.discussionId).emit('message', savedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  process.exit(0);
});
