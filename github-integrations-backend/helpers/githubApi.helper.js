import axios from "axios";
import GitHub from "github-api";

const fetchFromGitHub = async (url, accessToken) => {
  var gh = new GitHub({
    token: accessToken,
  });
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// GitHub API base URL
const GITHUB_API_URL = "https://api.github.com";

// Function to fetch organizations
export const getOrganizations = async (token) => {
  var gh = new GitHub({
    token: accessToken,
  });
  const response = await axios.get(`${GITHUB_API_URL}/user/orgs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Function to fetch repositories for an organization
export const getRepositoriesForOrg = async (token, orgName) => {
  const response = await axios.get(`${GITHUB_API_URL}/orgs/${orgName}/repos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Function to fetch commits for a repository
export const getCommitsForRepo = async (token, orgName, repoName) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${orgName}/${repoName}/commits`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Function to fetch pull requests for a repository
export const getPullRequestsForRepo = async (token, orgName, repoName) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${orgName}/${repoName}/pulls`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Function to fetch issues for a repository
export const getIssuesForRepo = async (token, orgName, repoName) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${orgName}/${repoName}/issues`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Function to fetch changelogs for issues (comments)
export const getChangelogsForIssue = async (
  token,
  orgName,
  repoName,
  issueNumber
) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${orgName}/${repoName}/issues/${issueNumber}/comments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Function to fetch users in an organization
export const getUsersForOrg = async (token, orgName) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/orgs/${orgName}/members`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export default {
  fetchFromGitHub,
  getOrganizations,
  getRepositoriesForOrg,
  getCommitsForRepo,
  getPullRequestsForRepo,
  getIssuesForRepo,
  getChangelogsForIssue,
  getUsersForOrg,
};
