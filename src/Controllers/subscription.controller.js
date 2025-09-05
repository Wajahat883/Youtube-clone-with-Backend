import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Toggle Subscription (Subscribe/Unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    if (channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    if (subscription) {
        await subscription.deleteOne()
        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    }

    await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, null, "Subscribed successfully")
    )
})


//  Get Subscriber List of a Channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "name email")

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})


// Get Channels Subscribed by a User
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    if (subscriberId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this data")
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name email")

    return res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
