import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    section: {type: String, required: true, unique: true},
    });

export default mongoose.models.banner || mongoose.model("banner", bannerSchema);