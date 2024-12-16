import mongoose from 'mongoose';

// Define the schema for the commit
const CommitSchema = new mongoose.Schema({
    sha: String,
    message: String,
    url: String,
    author: Object,
    repoId: String,
});

const Commit = mongoose.model('Commit', CommitSchema);

export default Commit;