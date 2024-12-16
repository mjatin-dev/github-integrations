import mongoose from 'mongoose';

// Define the schema for the PullRequest
const PullRequestSchema = new mongoose.Schema({
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
    url: {
        type: String,
        required: true,
        trim: true,
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
        timestamps: true
    });

const PullRequest = mongoose.model('PullRequest', PullRequestSchema);

export default PullRequest