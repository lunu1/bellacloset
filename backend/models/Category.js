import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  label: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  image: { type: String, default: null },
  position: { type: Number, default: 0, },
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);