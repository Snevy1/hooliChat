import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";


export const createOrUpdateChannel = async (request, response, next) => {
    try {
        const { name, members } = request.body;
        const userId = request.userId;

        // Check if the admin user exists
        const admin = await User.findById(userId);
        if (!admin) {
            return response.status(400).send("Admin user not found");
        }

        // Validate members
        const validMembers = await User.find({
            _id: { $in: members }
        });

        if (validMembers.length !== members.length) {
            return response.status(400).send("Some members are not valid users");
        }

        // Check if a channel with the same name exists
        let channel = await Channel.findOne({ name });

        if (channel) {
            // **Updating existing channel**
            const existingMembers = new Set(channel.members.map(member => member.toString()));
            const newMembers = members.filter(member => !existingMembers.has(member));

            if (newMembers.length === 0) {
                return response.status(400).send("All selected members are already in the channel");
            }

            channel.members.push(...newMembers);
            await channel.save();

            return response.status(200).json({ message: "Members added successfully", channel });
        } else {
            // **Creating a new channel**
            channel = new Channel({
                name,
                members,
                admin: userId,
            });

            await channel.save();
            return response.status(201).json({ message: "Channel created successfully", channel });
        }
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};



export const getUserChannels = async(request,response,next)=>{
    try {
        const userId = new mongoose.Types.ObjectId(request.userId);

        const channels = await Channel.find({
            $or:[{admin: userId}, {members: userId}]
        }).sort({updatedAt:-1});

         return response.status(201).json({channels})

    } catch (error) {

        console.log({error})

        return response.status(500).send("Internal Server Error");
        
    }
}


export const getChannelMessages = async(request,response,next)=>{
    try {
        const {channelId} = request.params;

        const channel = await Channel.findById(channelId).populate({path: "messages", populate: {
            path:"sender", select: "firstName lastName email_id image color"
        }});

        if(!channel){
            return response.status(404).send("Channel not found")
        }

        const messages = channel.messages;
         return response.status(201).json({
            messages
         })

    } catch (error) {

        console.log({error})

        return response.status(500).send("Internal Server Error");
        
    }
}


