import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Toggle Video Like
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const like = await Like.findOne({ video: videoId, user: req.user._id });

    if (like) {
        await like.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Video unliked", null));
    }

    await Like.create({ video: videoId, user: req.user._id });
    return res.status(200).json(new ApiResponse(200, "Video liked", null));
});

// Toggle Comment Like
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const like = await Like.findOne({ comment: commentId, user: req.user._id });

    if (like) {
        await like.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Comment unliked", null));
    }

    await Like.create({ comment: commentId, user: req.user._id });
    return res.status(200).json(new ApiResponse(200, "Comment liked", null));
});

//  Toggle Tweet Like
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const like = await Like.findOne({ tweet: tweetId, user: req.user._id });

    if (like) {
        await like.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Tweet unliked", null));
    }

    await Like.create({ tweet: tweetId, user: req.user._id });
    return res.status(200).json(new ApiResponse(200, "Tweet liked", null));
});

// Get All Liked Videos with Pagination
const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            {
                path: "video",
                populate: { path: "user", select: "name email" }
            }
        ]
    };

    const filter = { user: req.user._id, video: { $ne: null } };

    const likedVideos = await Like.paginate(filter, options);

    return res
        .status(200)
        .json(new ApiResponse(200, "Liked videos fetched successfully", likedVideos));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
};
