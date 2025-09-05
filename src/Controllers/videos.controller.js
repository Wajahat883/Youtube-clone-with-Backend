import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadonCloudinary } from "../utils/Cloudinary.js"


const getAllVideos =asyncHandler(async(eeq,res)=>{
    const {page=1,limit=10,sortBy, sortType, userId}=req.query
    
})