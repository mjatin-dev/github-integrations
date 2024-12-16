import express from 'express';
import { redirectToGitHub, handleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/github', redirectToGitHub); // Redirects to GitHub for auth
router.get('/github/callback', handleCallback); // Handles GitHub's response

export default router;
