import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../Models/User.models.js";
import { uploadonCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

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
        throw new ApiError(404, "Api does't exit")
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
        $set: {
            refreshToken: undefined,
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
        .clearCookie("accessToken", options).json(new ApiResponse(200, {}, "User logged out"))
})


const refrehAccessToken=asyncHandler(async(req,res)=>{
    req.cookies.refreshToken||refrehAccessToken.body.refreshToke
    if(!refrehAccessToken){
        throw new ApiError(401,"unotherized request")
    }
    try {
        const decodedRefreshToken=jwt.verify(refrehAccessToken,
            process.env.REFRESH_TOKEN_SECRET )
            const user = await User.findById(decodedRefreshToken?._id)
    if (!user){
        throw new ApiError(401,"Invalid Refresh Token")
    }
    if(decodedRefreshToken!==user?.refreshToken){
         throw new ApiError(401,"Refresh Token is expired or used")
    }
    const options={
        httpOnly:true,
        secure:true,
    }
    const{accessToken,newrefreshToken}=await genrateAccessandRefreshToken(user._id)
    return res.status(200).cookie("accessToken",accessToken).cookie("refrehToken",refreshToken).json(new ApiResponse(200,
        {accessToken,newrefreshToken},"Access token refreshed"
    ))
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

export { registerUser, loginUser, logOutuser,refrehAccessToken };
