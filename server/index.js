import express from'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import authRoutes from './routes/AuthRoutes.js'



dotenv.config();

const app = express();

const  port = process.env.PORT || 3001;

const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials:true,
}))

app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRoutes)

const server = app.listen(port, ()=>{
    
    console.log(`Server is running at http://localhost:${port}`)
})

mongoose.connect(databaseURL).then(()=>console.log("Database connection successfull")).catch((error)=>console.log(error.message))
