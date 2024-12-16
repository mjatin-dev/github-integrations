import mongoose from 'mongoose';

// Define the schema for the GitHub integration
const githubIntegrationSchema = new mongoose.Schema({
  user: {
    id: String,
    login: String,
    name: String,
  },
  connectedAt: { type: Date, default: Date.now },
  accessToken: String,
  refreshToken: String,
});

const GitHubIntegration = mongoose.model('GitHubIntegration', githubIntegrationSchema);

// Use default export
export default GitHubIntegration;