import { Router } from "express";
import { createSession, availableSessions, bookSession, completeSession } from "../controllers/sessionController";
const router = Router();
router.post("/", createSession);
router.get("/available", availableSessions);
router.post("/:id/book", bookSession);
router.patch("/:id/complete", completeSession);
export default router;
