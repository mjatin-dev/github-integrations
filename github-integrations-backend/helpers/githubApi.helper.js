import { getDatabaseClient } from "./database.helper.js";

/**
 *
 * @param {*} repoId
 * @param {*} page
 * @param {*} limit
 * @param {*} filters
 * @returns
 */
export const aggregateRepositoryData = async (
  repoId,
  page = 1,
  limit = 20,
  filters = {}
) => {
  const { client, db } = getDatabaseClient();

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: { id: repoId } }, // Match specific repository
    {
      $lookup: {
        from: "Commit",
        localField: "repo_id",
        foreignField: "id",
        as: "commits",
      },
    },
    {
      $lookup: {
        from: "PullRequest",
        localField: "repo_id",
        foreignField: "id",
        as: "pull_requests",
      },
    },
    {
      $lookup: {
        from: "Issue",
        localField: "repo_id",
        foreignField: "id",
        as: "issues",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        created_at: 1,
        commits: { $slice: ["$commits", skip, limit] },
        pull_requests: { $slice: ["$pull_requests", skip, limit] },
        issues: { $slice: ["$issues", skip, limit] },
      },
    },
  ];

  return await db.collection("Repository").aggregate(pipeline).toArray();
};

/**
 *
 * @returns
 */
export const getTickets = async () => {
  const { client, db } = getDatabaseClient();
  return db
    .collection("Issue")
    .find({}, { projection: { id: 1, title: 1 } })
    .limit(10)
    .toArray();
};

/**
 *
 * @param {*} id
 * @returns
 */
export const getTicketById = async (id) => {
  try {
    const { client, db } = getDatabaseClient();
    return await db.collection("Issue").findOne({ id: Number(id) });
  } catch (error) {
    console.log("Error", error);
  }
};

/**
 *
 * @param {*} searchTerm
 * @returns
 */
export const searchAllCollection = async (searchTerm) => {
  try {
    const { db } = getDatabaseClient();
    // Perform searches across collections
    const users = await db
      .collection("User")
      .find({ $text: { $search: searchTerm.toString() } })
      .toArray();

    const commitsTextSearch = await db
      .collection("Commit")
      .find({ $text: { $search: searchTerm.toString() } })
      .toArray();

    const commitsNumericSearch = await db
      .collection("Commit")
      .find({ repo_id: { $eq: parseInt(searchTerm) } })
      .toArray();

    const pullTextSearch = await db
      .collection("PullRequest")
      .find({ $text: { $search: searchTerm.toString() } })
      .toArray();

    const pullNumericSearch = await db
      .collection("PullRequest")
      .find({ repo_id: { $eq: parseInt(searchTerm) } })
      .toArray();

    // Combine results
    const results = [
      ...users,
      ...commitsTextSearch,
      ...commitsNumericSearch,
      ...pullTextSearch,
      ...pullNumericSearch,
    ];

    return {
      columns: results?.length ? Object.keys(results[0]) : [],
      data: results?.length ? results : [],
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 *
 * @param {*} startDate
 * @param {*} endDate
 * @returns
 */
export const findCommits = async (startDate, endDate) => {
  try {
    const {db} = getDatabaseClient()
    const commits = await db
      .collection("Commit")
      .find({
        commitDate: {
          $gte: new Date(startDate), // startDate should be a string like '2024-01-01' or Date object
          $lte: new Date(endDate), // endDate should be a string like '2024-12-31' or Date object
        },
      })
      .toArray();
    return commits;
  } catch (error) {
    return error;
  }
};

/**
 * 
 * @param {*} selectedStatus 
 * @returns 
 */
export const findPullRequests = async (selectedStatus) => {
  try {
    const {db} = getDatabaseClient()

    const pullRequests = await db
      .collection("PullRequest")
      .find({
        state: new RegExp(`^${selectedStatus}$`, "i"), // selectedStatus can be 'open', 'closed', etc.
      })
      .toArray();
    return pullRequests;
  } catch (error) {
    console.log("Error",error)
    return error;
  }
};
