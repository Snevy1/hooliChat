import Message from "../models/MessagesModel.js";

import {mkdirSync, renameSync} from 'fs';
import path from "path";



export const getMessages = async(request,response,next)=>{
    try {

        const user1 = request.userId;

        const user2 = request.body.id;

        if(!user1 || !user2){
            return response.status(400).send("Both user ID's are required.")
        }

        const messages = await Message.find({
            $or:[
                {
                    sender: user1, recipient: user2
                },
                {
                    sender: user2, recipient: user1
                },
            ]

        }).sort({ timestamp: 1})



        return response.status(200).json({
            messages
        })






    } catch (error) {

        console.log({error})

        return response.status(500).send("Internal Server Error");
        
    }
}


export const uploadFile = async(request,response,next)=>{
    try {

        if(!request.file){
            return response.status(400).send("File is required");
        }

        const date = Date.now();

        const tmpDir = path.join("/tmp", `files/${date}`);
       const tmpFilePath = path.join(tmpDir, request.file.originalname);
          
       mkdirSync(tmpDir, { recursive: true }); // Create the temporary directory
       renameSync(request.file.path, tmpFilePath); // Move the file to the temporary directory
   


        return response.status(200).json({
            filePath:tmpFilePath
        })






    } catch (error) {

        console.log({error})

        return response.status(500).send("Internal Server Error");
        
    }
}


