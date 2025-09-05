import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadonCloudinary } from "../utils/Cloudinary.js"

// 📌 Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, userId } = req.query

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: {}
    }

    
    if (sortBy && sortType) {
        options.sort[sortBy] = sortType === "desc" ? -1 : 1
    }

    const filter = {}
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid UserId")
        }
        filter.user = userId
    }

    const videos = await Video.paginate(filter, options)
    res.status(200).json(new ApiResponse(200, "All Videos", videos))
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!req.file) {
        throw new ApiError(400, "Video file is required")
    }

    const { secure_url } = await uploadonCloudinary(req.file.path, "video")
    if (!secure_url) {
        throw new ApiError(500, "Failed to upload video to Cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        videoUrl: secure_url,
        user: req.user._id
    })

    res.status(201).json(new ApiResponse(201, "Video published successfully", video))
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId).populate({
        path: "user",
        select: "name email"
    })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res.status(200).json(new ApiResponse(200, "Video retrieved successfully", video))
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    if (title) video.title = title
    if (description) video.description = description

    //  Thumbnail update
    if (req.file) {
        const { secure_url } = await uploadonCloudinary(req.file.path, "image")
        if (secure_url) video.thumbnail = secure_url
    }

    await video.save()

    res.status(200).json(new ApiResponse(200, "Video updated successfully", video))
})

//  Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await video.deleteOne()

    res.status(200).json(new ApiResponse(200, "Video deleted successfully"))
})

// Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    res.status(200).json(new ApiResponse(200, "Video publish status updated successfully", video))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
