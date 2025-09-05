import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get channel stats (total videos, subscribers, likes, views)
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    // total videos uploaded by this channel
    const totalVideos = await Video.countDocuments({ user: channelId });

    // total subscribers of this channel
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // total likes on videos of this channel
    const totalLikes = await Like.countDocuments({ videoOwner: channelId });

    // total views on all videos of this channel
    const totalViewsAgg = await Video.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(channelId) } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = totalViewsAgg.length > 0 ? totalViewsAgg[0].totalViews : 0;

    return res.status(200).json(
        new ApiResponse(200,
            {
                totalVideos,
                totalSubscribers,
                totalLikes,
                totalViews
            },
            "Channel stats fetched successfully"
        )
    );
});

// ✅ Get all videos uploaded by a channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const videos = await Video.find({ user: channelId }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

export {
    getChannelStats,
    getChannelVideos
};
