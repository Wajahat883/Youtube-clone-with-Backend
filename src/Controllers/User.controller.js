import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import User from "../Models/User.models.js"
import { uploadonCloudinary } from "../utils/Cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";
import { json } from "express";

const registerUser = asyncHandler(async (req, res) => {
    //get user details
    const { fullname, email, username, password } = req.body

    console.log("email:", email)

    if ([fullname, email, username, password].some((feild) => feild?.trim() === "")) {
        throw new ApiError(400, "All feilds are required")
    }
    const existingUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        throw new ApiError(409, "User name and email alredy exit")
    }
    const avatarLocalpath = req.files?.avatar[0]?.path


    const coverImageLocalpath = req.files?.coverImage[0]?.path

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avtar file is require")
    }

    const avtar = await uploadonCloudinary(avatarLocalpath)
    const coverImage = await uploadonCloudinary(coverImageLocalpath)

    if(!avtar){
        throw new ApiError(400,"Atar file not uploaded")
    }
   const user= await User.create({
        fullname,
        avatar:avtar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase(), 
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(createdUser){
        throw new ApiError(500,"Something went wrong while rgistring the user")
    }

    return res.status(201,json(
        new ApiResponse(200,createdUser,"User register successfully")
    ))
})

export { registerUser };