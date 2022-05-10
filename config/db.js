import mongoose from "mongoose";

const MONGO_URL = `mongodb+srv://wcordova:7RJUQdWNKWYv4kcM@cluster0.urvz0.mongodb.net/test`;


const connectDB = async() => {

    try {
        
        await mongoose.connect(MONGO_URL,{
                useNewUrlParser: true,
                useUnifiedTopology: true,
                // useFindAndModify: false,
                // useCreateIndex: true
            })

        console.log('db online')
        
    } catch (error) {
        console.log(error)
        // throw new Error(error);
    }
    
}

export default connectDB;