import { Router } from 'express';
import { getVideoComments, addComment, deleteComment, updateComment } from "../Controllers/comment.controller.js"

import { verifyJWT } from "../middlewares/verifyJWT.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router