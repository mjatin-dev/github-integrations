import mongoose from 'mongoose';

// Organization Schema
const OrganizationSchema = new mongoose.Schema({
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
    name: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    reposUrl: {
        type: String,
        required: true,
        trim: true,
    },
    members: [
        {
            id: { type: String, required: true },
            login: { type: String, required: true },
            avatarUrl: { type: String, trim: true },
        },
    ],
},
    {
        timestamps: true,

    });


const Organization = mongoose.model('Organization', OrganizationSchema);

// Use default export
export default Organization