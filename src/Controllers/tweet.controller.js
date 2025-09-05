import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


//  Create Tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        user: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )
})


//  Get Tweets of a User
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const tweets = await Tweet.find({ user: userId })
        .populate("user", "name email")
        .sort({ createdAt: -1 }) // latest first

    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})


// Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, user: req.user._id },
        { content: content.trim() },
        { new: true }
    )

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized")
    }

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )
})


//  Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        user: req.user._id
    })

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized")
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully")
    )
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
