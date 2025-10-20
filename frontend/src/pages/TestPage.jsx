import React, { useState } from "react";
import axios from "axios";

const UploadSubtitle = () => {
  const [movieId, setMovieId] = useState("");
  const [language, setLanguage] = useState("vi");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !movieId) {
      setMessage("Vui lòng nhập movieId và chọn file .srt");
      return;
    }

    const formData = new FormData();
    formData.append("movieId", movieId);
    formData.append("language", language);
    formData.append("subtitle", file);

    try {
      const res = await axios.post("http://localhost:5001/api/movies/subtitles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(`Upload thành công! Subtitle ID: ${res.data._id}`);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi upload subtitle.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload Subtitle (.srt)</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-600">
          Movie ID:
          <input
            type="text"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Nhập ID của movie"
          />
        </label>

        <label className="text-sm font-medium text-gray-600">
          Language:
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="jp">日本語</option>
          </select>
        </label>

        <label className="text-sm font-medium text-gray-600">
          Subtitle File (.srt):
          <input
            type="file"
            accept=".srt"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 block w-full text-gray-700"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Upload
        </button>

        {message && (
          <p className="text-center text-sm mt-2 text-gray-700 bg-gray-100 p-2 rounded-md">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default UploadSubtitle;
