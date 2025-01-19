import express from "express";
import {googleAuth, signIn, signUp} from  "../controllers/auth.js";

const router = express.Router();

router.post('/gAuth', googleAuth);
router.post('/signIn', signIn);
router.post('/signUp', signUp);

export default router;