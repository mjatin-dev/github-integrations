import { Octokit } from "octokit";
import { getDatabaseClient } from "../helpers/database.helper.js";

/**
 * Get GitHub Integration Status
 * @param {*} req
 * @param {*} res
 * @returns GitHub status
 */
export const getGitHubStatus = async (req, res) => {
  try {
    try {

      const { client, db } = getDatabaseClient();
      const collection = db.collection("GitHubIntegration");
      
      const integration = await collection.findOne({
        "user.id": req.user.userId,
      });

      if (!integration) {
        return res.status(404).json({ connected: false });
      }
      res.status(200).json({
        connected: true,
        userId: integration.user.id,
        connectedAt: integration.connectedAt,
        githubUsername: integration.user.login,
        userEmail: integration.user.login,
        avatarUrl: "",
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching integration status" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Remove GitHub Integration
 * @param {*} req
 * @param {*} res
 */
export const removeGithub = async (req, res) => {
  try {
    const { userId } = req.body; // Pass the user ID in the request body

    // Find and delete the user's GitHub integration
    await GitHubIntegration.findOneAndDelete({ "user.id": userId });

    res
      .status(200)
      .json({ message: "GitHub integration removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove integration" });
  }
};

/**
 * Fetch list organizations
 * @param {*} req
 * @param {*} res
 */
export const fetchOrganizations = async (req, res) => {
  try {
    const { client, db } = getDatabaseClient();
    let collection = db.collection("GitHubIntegration");
    const integration = await collection.findOne({
      "user.id": req.user.userId,
    });
    const octokit = new Octokit({
      auth: integration.accessToken,
    });
    const response = await octokit.request("GET /user/orgs", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const organizations = response.data ?? [];
    collection = db.collection("Organization");
    for (const org of organizations) {
      const findOrganization = await collection.findOne({ id: org.id });
      if (!findOrganization) {
        const savedOrg = await collection.findOneAndUpdate(
          { id: org.id },
          { $set: org },
          { upsert: true, returnDocument: "after" }
        );
        await fetchRepositories(octokit, savedOrg);
        await fetchUsers(octokit, savedOrg);
      }
    }
    res.status(200).json({ organizations });
  } catch (err) {
    console.error("Error fetching organizations:", err);
  }
};

/**
 * Fetch List of repostories
 * @param {*} octokit
 * @param {*} orgId
 * @param {*} reposUrl
 */
export const fetchRepositories = async (octokit, org) => {
  try {
    const response = await octokit.request(`GET /orgs/${org.login}/repos`, {
      org: "ORG",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const repositories = response.data;
    const { client, db } = getDatabaseClient();
    const collection = db.collection("Repository");
    for (const repo of repositories) {
      const fetchRepos = await collection.findOne({ id: repo.id });
      if (!fetchRepos) {
        const savedRepo = await collection.findOneAndUpdate(
          { id: repo.id },
          {
            $set: repo,
          },
          { upsert: true, returnDocument: "after" }
        );

        console.log(`Repository saved:${savedRepo}`);

        // Fetch commits, pull requests, and issues for the repository
        await fetchCommits(octokit, savedRepo);
        await fetchPullRequests(octokit, savedRepo);
        await fetchIssues(octokit, savedRepo);
      }
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Fetch List of Commits
 * @param {*} githubApi
 * @param {*} repoId
 * @param {*} commitsUrl
 */
export const fetchCommits = async (octokit, repo) => {
  try {
    const response = await octokit.request(
      `GET /repos/${repo?.owner?.login}/${repo?.name}/commits`,
      {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    const allCommits = response?.data;
    const { client, db } = getDatabaseClient();
    const collection = db.collection("Commit");
    for (const commit of allCommits) {
      await collection.findOneAndUpdate(
        { sha: commit.sha },
        {
          $set: commit,
        },
        { upsert: true, new: true }
      );

      console.log(`Commit saved: ${commit.sha}`);
    }
  } catch (err) {
    console.error("Error fetching commits:", err);
    throw new Error(err.message);
  }
};

/**
 * Fetch List of Pull Requests
 * @param {*} githubApi
 * @param {*} repoId
 * @param {*} pullsUrl
 */
export const fetchPullRequests = async (octokit, repo) => {
  try {
    const response = await octokit.request(
      `GET /repos/${repo?.owner?.login}/${repo?.name}/pulls`,
      {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    const pullRequests = response?.data;
    const { client, db } = getDatabaseClient();
    const collection = db.collection("PullRequest");
    for (const pr of pullRequests) {
      await collection.findOneAndUpdate(
        { id: pr.id }, // Match the PR by ID
        {
          $set: pr,
        },
        { upsert: true, new: true } // Insert or update the document
      );

      console.log(`Pull Request saved: ${pr.title}`);
    }

  } catch (error) {
    console.error("Error fetching pull requests:", error.message);
    throw new Error(error.message); // Propagate the error for the caller to handle
  }
};

/**
 * Fetch List of Issues
 * @param {*} githubApi
 * @param {*} repoId
 * @param {*} issuesUrl
 */
export const fetchIssues = async (octokit, repo) => {
  try {
    const response = await octokit.request(
      `GET /repos/${repo?.owner?.login}/${repo?.name}/issues`,
      {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    const issues = response.data;
    const { client, db } = getDatabaseClient();
    const collection = db.collection("Issue");
    for (const issue of issues) {
      await collection.findOneAndUpdate(
        { id: issue.id },
        {
          $set: issue,
        },
        { upsert: true, new: true }
      );

      console.log(`Issue saved: ${issue.title}`);
    }
  } catch (err) {
    console.log("Error fetching issues:", err);
    throw new Error(err.message);
  }
};

/**
 * Fetch Github Record from Database
 * @param {*} req
 * @param {*} res
 */
export const fetchGithubRecordFromDatabase = async (req, res) => {
  const { client, db } = getDatabaseClient();

  try {
    const fetchGithubUsers = await db.collection("GitHubIntegration").find();
    const fetchOrganizations = await db.collection("Organization").find();
    const fetchRepositories = await db.collection("Repository").find();
    res
      .status(200)
      .json({ fetchGithubUsers, fetchOrganizations, fetchRepositories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch Users
 * @param {*} githubApi
 * @param {*} orgId
 * @param {*} usersUrl
 */
export const fetchUsers = async (octokit, org) => {
  try {
    const response = await octokit.request(`GET /orgs/${org.login}/members`, {
      org: "ORG",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const { client, db } = getDatabaseClient();
    const collection = db.collection("User");

    const users = response?.data;
    for (const user of users) {
      await collection.findOneAndUpdate(
        { id: user.id }, // Match the user by ID
        {
          $set: user,
        },
        { upsert: true, new: true } // Insert or update the document
      );

      console.log(`User saved: ${user.login}`);
    }

  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw new Error(error.message); // Propagate the error for the caller to handle
  }
};

/**
 * Fetch Github Record from Database
 * @param {*} req
 * @param {*} res
 */
export const fetchDatabaseEntities = async (req, res) => {
  try {
    const { client, db } = getDatabaseClient();
    const collections = await db.listCollections().toArray();

    res.status(200).json({ collections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const fetchRecordsByEntityName = async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { client, db } = getDatabaseClient();
    // Fetch the records from the specified collection
    const collection = db.collection(collectionName);
    const records = await collection.find().skip(0).limit(100).toArray();

    if (records.length === 0) {
      return res
        .status(404)
        .json({ message: "No records found in this collection." });
    }

    const filteredRecords = records.map((record) => {
      const { _id, __v, ...filteredData } = record; // Exclude _id and __v
      return filteredData;
    });

    // Separate columns (fields) and data
    const columns = Object.keys(filteredRecords[0]);

    res.status(200).json({
      collectionName,
      columns,
      data: filteredRecords.map((item) =>
        item?.author ? { ...item, author: item.author.login } : item
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
