import { Router } from 'express';
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../Controllers/like.controller.js"
import { verifyJWT } from "../middlewares/verifyJWT.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router