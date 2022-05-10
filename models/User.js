import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    friends: [
        {
            ref: 'Personas',
            type: mongoose.Schema.Types.ObjectId
        }
    ]
})

export default mongoose.model('User', UserSchema)