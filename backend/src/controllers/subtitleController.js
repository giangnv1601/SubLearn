import mongoose from "mongoose"
import Subtitle from "../models/Subtitle.js";
import Movie from "../models/Movie.js";

export const uploadSubtitle = async (req, res) => {
  try {
    const { movieId, language } = req.body || {};
    if (!movieId || !language) {
      return res.status(400).json({ message: "movieId & language are required" });
    }
    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }
    const lang = String(language).trim().toLowerCase();
    if (!['en', 'vi'].includes(lang)) {
      return res.status(400).json({ message: "language must be 'en' or 'vi'" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No subtitle file uploaded" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const srtContent = req.file.buffer.toString("utf-8").trim();

    // ⬇️ upsert: có thì update, chưa có thì tạo
    const updated = await Subtitle.findOneAndUpdate(
      { movieId, language: lang },
      { $set: { srtContent } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 200 là ổn: hành vi "ghi đè" / "tạo mới" đều trả object cuối cùng
    return res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    console.error("Error uploading subtitle:", error);
    // Nếu unique index đã bật và có race condition -> 11000 vẫn có thể xảy ra
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Duplicate subtitle for movie & language" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const getSubtitlesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params
    const withContent = req.query.withContent === '1' // mặc định không trả srtContent

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({ ok: false, message: "Invalid movieId" })
    }

    // projection: ẩn srtContent nếu không yêu cầu
    const projection = withContent ? undefined : { srtContent: 0 }

    const items = await Subtitle
      .find({ movieId }, projection)
      .sort({ language: 1 })       // 'en' trước 'vi' (tuỳ nhu cầu)
      .lean()

    // map nhanh theo language
    const byLang = Object.fromEntries(items.map(it => [it.language, it]))
    const has = { en: !!byLang.en, vi: !!byLang.vi }
    const latest = {
      en: byLang.en?.updatedAt || null,
      vi: byLang.vi?.updatedAt || null
    }

    return res.status(200).json({ ok: true, data: items, has, latest })
  } catch (error) {
    console.error("Error fetching subtitles:", error)
    return res.status(500).json({ ok: false, message: "Server error" })
  }
}