import mongoose from 'mongoose'

export async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected")
    } catch(err){
        console.error("MongoDB failed to connect", err)
        process.exit(1);
    }
}