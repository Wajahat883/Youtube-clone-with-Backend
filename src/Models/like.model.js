import mongoose, { Schema } from "mongoose";

const LikeSchema= new Schema({

    video:{
        type:Schema.Types.ObjectId,
        ref:"Videos"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Twwet"
    },
    likeBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Like =mongoose.model("Like",LikeSchema)