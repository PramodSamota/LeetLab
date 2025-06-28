import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
  addProblemToPlaylist,
  clonePlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPrivatePlaylistDetails,
  getAllPublicPlaylistDetails,
  getPlaylistDetails,
  removeProblemFromPlaylist,
  updatePlaylist,
} from "../controller/playlist.controller.js";

const router = express.Router();

router.get("/private-playlist", verifyUser, getAllPrivatePlaylistDetails);
router.get("/public-playlist", verifyUser, getAllPublicPlaylistDetails);
router.get("/:plid/playlistById", getPlaylistDetails);
router.post("/create-playlist", verifyUser, createPlaylist);
router.put("/:plid/update-playlist", verifyUser, updatePlaylist);
router.delete("/:plid/delete-playlist", verifyUser, deletePlaylist);
router.post("/:plid/clone-playlist", verifyUser, clonePlaylist);
router.post("/:plid/addProblem/:pid", verifyUser, addProblemToPlaylist);
router.get("/:plid/removeProblem/:pid", verifyUser, removeProblemFromPlaylist);

export default router;
