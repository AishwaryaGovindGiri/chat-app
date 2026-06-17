import mongoose  from "mongoose";

// function to connect with mongodb
export const connectDB = async () => {
    try {
        //event
        //when 'connected' to mongoose we get this msg 
        mongoose.connection.on('connected' , ()=> console.log("Database connected"));
        //this connect to monggose
        await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`)
    } catch(error)  {
        return error
    }
}