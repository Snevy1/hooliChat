import express from'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import authRoutes from './routes/AuthRoutes.js'
import contactsRoutes from './routes/ContactsRoutes.js'
import setupSocket from './socket.js'
import messagesRoutes from './routes/MessagesRoutes.js'
import channelRoutes from './routes/ChannelRoutes.js'



dotenv.config();

const app = express();

const  port = process.env.PORT || 3001;

const databaseURL = process.env.DATABASE_URL;

const allowedOrigins = [process.env.ORIGIN, 'https://hooli-chat-client.vercel.app']; 
app.use(cors({ 
    origin: function (origin, callback) { 
        if (!origin || allowedOrigins.includes(origin)) { 
            callback(null, true);
         } else {
             callback(new Error('Not allowed by CORS'));

          }
         },
          methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
          credentials: true, 
        }));

app.use("/tmp/profiles",express.static("tmp/profiles") )

app.use("/tmp/files", express.static("tmp/files"))
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use("/api/contacts", contactsRoutes)
app.use("/api/messages", messagesRoutes)

app.use("/api/channel", channelRoutes)

app.get('/', (req, res) => {
    res.status(200).send('Backend is running');
  });

const server = app.listen(port, ()=>{
    
    console.log(`Server is running at http://localhost:${port}`)
})

setupSocket(server)



mongoose.connect(databaseURL).then(()=>console.log("Database connection successfull")).catch((error)=>console.log(error.message))
