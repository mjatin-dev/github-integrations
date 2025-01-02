import express from "express";
import {
  fetchDatabaseEntities,
  fetchGithubRecordFromDatabase,
  fetchOrganizations,
  fetchRecordsByEntityName,
  fetchRepoData,
  fetchTicketById,
  fetchTickets,
  filterRecord,
  getGitHubStatus,
  removeGithub,
  searchRecordInCollection,
} from "../controllers/github.controller.js";
import authenticateUser from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/status", authenticateUser, getGitHubStatus);
router.get("/organizations", authenticateUser, fetchOrganizations);
router.delete("/remove-integration", authenticateUser, removeGithub);

router.get(
  "/fetch-database-collection",
  authenticateUser,
  fetchDatabaseEntities
);
router.get(
  "/fetch-entity-record/:collectionName",
  authenticateUser,
  fetchRecordsByEntityName
);
router.get(
  "/fetch-github-data",
  authenticateUser,
  fetchGithubRecordFromDatabase
);
router.get("/fetch-repo/:repoId", authenticateUser, fetchRepoData);
router.get("/tickets", authenticateUser, fetchTickets);
router.get("/tickets/:ticketId", fetchTicketById);
router.get("/search/:searchTerm", searchRecordInCollection);
router.get("/filter", filterRecord);
router.get("/repositories", fetchRepoData);

export default router;
