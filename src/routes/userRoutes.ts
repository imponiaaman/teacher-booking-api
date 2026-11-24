import { Router } from "express";
import { createUser, getUserSessions, getUsers } from "../controllers/userController";
const router = Router();
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id/sessions", getUserSessions);
export default router;
