import mongoose, { Schema } from "mongoose";

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const UserShema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,

    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Videos"
        }
    ],
    password: {
        type: String,
        required: [true, 'password is required']
    },
    refreshToken: {
        type: String,
    }
}, {
    timestamps: true
})

UserShema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();


    this.password = await bcrypt.hash(this.password, 10)
    next()

})

UserShema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
UserShema.methods.genrateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.fullname,
            fullname: this.fullname
        }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }

    )
}

UserShema.methods.genrateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.fullname,
            fullname: this.fullname
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User", UserShema)