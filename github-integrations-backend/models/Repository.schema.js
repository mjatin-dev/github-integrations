import mongoose from 'mongoose';


// Define the schema for the Repository
const RepositorySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      url: {
        type: String,
        required: true,
        trim: true,
      },
      commitsUrl: {
        type: String,
        required: true,
        trim: true,
      },
      pullsUrl: {
        type: String,
        required: true,
        trim: true,
      },
      issuesUrl: {
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
      timestamps: true
    });

const Repository = mongoose.model('Repository', RepositorySchema);

export default Repository;