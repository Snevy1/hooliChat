import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path'; // Required for handling file paths
import authRoutes from './routes/AuthRoutes.js';
import contactsRoutes from './routes/ContactsRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoutes.js';
import channelRoutes from './routes/ChannelRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

// CORS setup
app.use(
  cors({
    origin: '*', // Allow all origins or replace '*' with your specific frontend URL if needed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Middleware
app.use('/tmp/profiles', express.static('tmp/profiles'));
app.use('/tmp/files', express.static('tmp/files'));
app.use(cookieParser());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/channel', channelRoutes);

// Serve the React frontend
const __dirname = path.resolve(); // Get the current directory path
app.use(express.static(path.join(__dirname, 'client/dist')));

// Fallback route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.get("/", (req,res)=>{
    res.send("Welcome to homepage");
})

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Setup WebSocket
setupSocket(server);

// Connect to MongoDB
mongoose
  .connect(databaseURL)
  .then(() => console.log('Database connection successful'))
  .catch((error) => console.log(error.message));
