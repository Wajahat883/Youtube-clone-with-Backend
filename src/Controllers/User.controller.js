import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../Models/User.models.js";
import { uploadonCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const genrateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.genrateAccessToken()
        const refreshToken = await user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            accessToken, refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "Something Went Wrong While Genrating Refresh Token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    console.log("REQ FILES:", req.files);
    console.log("REQ BODY:", req.body);
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "Username Or Email Already Exit.");
    }

    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadonCloudinary(avatarLocalpath);
    const coverImage = await uploadonCloudinary(coverImageLocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file not uploaded");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    //req body ->data
    //username or email
    //find the user 
    //password check 
    //refreshtoken assess token 
    //send in cookies
    //return res

    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or Password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "user does't exit")
    }
    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid user credential")
    }
    const { accessToken, refreshToken } = await
        genrateAccessandRefreshToken(user._id)


    const logedInuser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("accessToken",
        accessToken, options
    ).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200,
        {
            user: logedInuser, accessToken, refreshToken
        },
        "User logged in Successfully!"
    ))






})
const logOutuser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            refreshToken: null,
        }
    }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken", options)
        .clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out"))
})


const refrehAccessToken = asyncHandler(async (req, res) => {
    req.cookies.refreshToken || refrehAccessToken.body.refreshToke
    if (!refrehAccessToken) {
        throw new ApiError(401, "unotherized request")
    }
    try {
        const decodedRefreshToken = jwt.verify(refrehAccessToken,
            process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedRefreshToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
        if (decodedRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken, newrefreshToken } = await genrateAccessandRefreshToken(user._id)
        return res.status(200).cookie("accessToken", accessToken).cookie("refrehToken", refreshToken).json(new ApiResponse(200,
            { accessToken, newrefreshToken }, "Access token refreshed"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, conPassword } = req.body

    // if(newPassword===conPassword){

    // }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")


    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password change successfully!"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(200, req.user, "current user fetch successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All feilds are required")
    }
    const user =await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname,
                email: email,
            }
        },
        { new: true }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Account updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalpath = req.file?.path;   //  single file ke liye
    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadonCloudinary(avatarLocalpath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,   // __id ki jagah _id
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar image uploaded successfully!"));
});


const updateUsercoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalpath = req.file?.path;   //  single file ke liye
    if (!coverImageLocalpath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadonCloudinary(coverImageLocalpath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,   //  __id ki jagah _id
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Cover image uploaded successfully!"));
});


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelSubscribesToCount: {
                    $size: "$subscriberTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        }, {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribesToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,



            }

        }
    ]);
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exit!")

    }
    return res.status(200).json(new ApiResponse(200, channel[0], "user channel fetch successfully"))
})
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos", //  collection name lowercase hoga usually
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory", 
                pipeline: [
                    {
                        $lookup: {
                            from: "users", // ✅ user collection lowercase + plural
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        }
    ]);

    return res
      .status(200)
      .json(new ApiError(
        200,
        user.length > 0 ? user[0].watchHistory : [], 
        "watched history successfully!"
      ));
});






export {
    registerUser, loginUser, logOutuser,
    refrehAccessToken, changeCurrentPassword,
    getCurrentUser, updateAccountDetails,
    updateUsercoverImage, updateUserAvatar, getUserChannelProfile,
    getWatchHistory
};
