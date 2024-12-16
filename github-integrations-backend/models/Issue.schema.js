import mongoose from "mongoose";

// Define the schema for the Issue
const IssueSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        required: true,
    },
    repoId: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Issue = mongoose.model('Issue', IssueSchema);

export default Issue;