import dns from "dns";
import mongoose from 'mongoose'

dns.setServers(['1.1.1.1', '8.8.8.8' ]);

export async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4
        });
        console.log("MongoDB connected")
    } catch(err){
        console.error("MongoDB failed to connect", err)
        process.exit(1);
    }
}