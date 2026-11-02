import express from "express";
import { deleteWorkspace, getUserWorkspaces } from "../controllers/workspaceController.js";

const workspaceRouter = express.Router();

workspaceRouter.get("/", getUserWorkspaces);
workspaceRouter.delete("/:id", deleteWorkspace);

export default workspaceRouter;
