import Banner from "../models/Banner.js";

export const uploadBanner = async (req, res) => {
  try {
    const section = req.params.section;
    const imageUrl = req.file?.path; // cloudinary URL

    if (!section)
      return res
        .status(400)
        .json({ success: false, message: "Section is required" });

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    let banner = await Banner.findOne({ section });

    if (banner) {
      banner.imageUrl = imageUrl;
      await banner.save();
    } else {
      await Banner.create({ section, imageUrl }); // ✅ corrected here
    }

    res
      .status(200)
      .json({ success: true, message: "Banner updated", imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBanner = async (req, res) => {
  try {
    const section = req.params.section;
    const banner = await Banner.findOne({ section });

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json(banner);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

