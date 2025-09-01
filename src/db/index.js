import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv"
dotenv.config({
  path: './.env'
})

const connectDB = async () => {
  try {
    const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(`\n MongoDB Connected !! DB HOST:${connectionInstances.connection.host}`)
  } catch (err) {
    console.log("MONGO_DB CONNECTION ERROR:", err)
    process.exit(1)
  }
}

export default connectDB;