import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  label: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);