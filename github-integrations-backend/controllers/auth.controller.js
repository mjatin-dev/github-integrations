import axios from "axios";
import { generateToken } from "../helpers/jwt.helper.js";
import { getDatabaseClient } from "../helpers/database.helper.js";

/**
 * Redirect to GitHub for OAuth
 * @param {*} req
 * @param {*} res
 */
export const redirectToGitHub = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=repo,user,read:org`;
  res.redirect(url);
};

/**
 * Callback for GitHub
 * @param {*} req
 * @param {*} res
 */
export const handleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token } = tokenResponse.data;

    // Fetch user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, login, name } = userResponse.data;

    // Save to database
    const { client, db } = getDatabaseClient();
    const collection = db.collection("GitHubIntegration");
    
    await collection.findOneAndUpdate(
      { "user.id": id }, // Match user by id
      {
        $set: {
          user: { id, login, name },
          accessToken: access_token,
          connectedAt: new Date(),
        },
      },
      { upsert: true } // Create a new document if no match is found
    );
    

    const token = generateToken(id);

    res.redirect("http://localhost:4200?token=" + token);
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
