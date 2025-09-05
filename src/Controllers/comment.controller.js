import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Get all comments of a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    };

    const filter = { video: videoId };

    // Ensure paginate plugin is applied in Comment model
    const comments = await Comment.paginate(filter, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Video comments fetched successfully"));
});

// Add a new comment
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }
    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.create({
        text,
        video: videoId,
        user: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }
    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.text = text;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await comment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
