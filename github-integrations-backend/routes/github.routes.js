import express from "express";
import {
  fetchCommits,
  fetchDatabaseEntities,
  fetchGithubRecordFromDatabase,
  fetchOrganizations,
  fetchRecordsByEntityName,
  fetchRepositories,
  getGitHubStatus,
  removeGithub,
} from "../controllers/github.controller.js";
import authenticateUser from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/status", authenticateUser, getGitHubStatus);
router.get("/organizations",authenticateUser, fetchOrganizations);
router.delete("/remove-integration",authenticateUser, removeGithub);

router.get("/fetch-database-collection",authenticateUser, fetchDatabaseEntities);
router.get("/fetch-entity-record/:collectionName",authenticateUser, fetchRecordsByEntityName);
router.get("/fetch-github-data",authenticateUser, fetchGithubRecordFromDatabase);;

export default router;
