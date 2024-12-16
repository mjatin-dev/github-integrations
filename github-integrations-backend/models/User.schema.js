import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    login: {
        type: String,
        required: true,
        trim: true,
    },
    avatarUrl: {
        type: String,
        required: true,
        trim: true,
    },
    orgId: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', UserSchema);

export default User;