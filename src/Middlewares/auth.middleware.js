import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../Models/User.models.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    let token = null; // 👈 yahan rakho, try ke bahar

    try {
        console.log("Initial Token:", token);

        // 1. Token from cookie
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        // 2. Token from header (Bearer <token>)
        if (!token && req.headers.authorization) {
            if (req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1]; // sirf token
            }
        }

        if (!token) {
            throw new ApiError(401, "Unauthorized Access: Token missing");
        }
        console.log("🔑 Token mil raha hai kya?", token);

        // ✅ Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refrehToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }

    // ✅ ye ab error nahi dega
    console.log("🍪 Cookies:", req.cookies);
    console.log("🔑 Authorization Header:", req.headers.authorization);
    console.log("🛠️ Token:", token, typeof token);
    console.log("🔐 Secret:", process.env.ACCESS_TOKEN_SECRET);
});
