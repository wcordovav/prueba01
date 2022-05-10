import mongoose from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';

const PersonSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    phone: {
        type: String,
        minlength: 3
    },
    street:{
        type: String,
        required: true,
        minlength: 3
    },
    city:{
        type: String,
        required: true,
        minlength: 3
    },

})

PersonSchema.plugin(uniqueValidator)

export default mongoose.model('Personas', PersonSchema);