import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; // Import necessary functions
import authRoutes from './routes/AuthRoutes.js';
import contactsRoutes from './routes/ContactsRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoutes.js';
import channelRoutes from './routes/ChannelRoutes.js';

dotenv.config();

// Compute __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN], // Ensure this is the correct frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));
app.use(cookieParser());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

// Serve static files from the React frontend (build or dist folder)
app.use(express.static(join(__dirname, '../client/dist')));

// Catch-all route to serve the React app for any other URL
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist', 'index.html'));
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Setup Socket
setupSocket(server);

// Connect to MongoDB
mongoose.connect(databaseURL)
    .then(() => console.log("Database connection successful"))
    .catch((error) => console.log(error.message));
