import mongoose from "mongoose";
import ENV from "./env";

const dbConnect = async (): Promise<typeof mongoose> => {
    return mongoose.connect(ENV.DB_URI)
}

export default dbConnect;