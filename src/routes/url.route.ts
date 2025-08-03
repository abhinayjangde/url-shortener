import express from 'express';
import { createURL, redirectURL } from '../controllers/url.controller.js';

const router = express.Router();

router.post("/create-url", createURL );
router.get("/:urlCode", redirectURL);

export default router;