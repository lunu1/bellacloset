import  { useState } from "react";
import axios from "axios";

const AdminBannerUpload = () => {
  const [section, setSection] = useState("hero");
  const [image, setImage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", image); // no need to append section again, it's in URL

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/banner/${section}`,
        formData
      );
      alert("Upload successful: " + response.data.message);
    } catch (error) {
      console.error("Upload failed", error);
      alert(
        "Upload failed: " + (error.response?.data?.message || error.message)
      );
    }
  }

  return (
    <div className="max-w-md p-4 mx-auto mt-10 border rounded">
      <h2 className="mb-4 text-xl font-bold">Upload Banner</h2>
      <form onSubmit={handleUpload}>
        <label className="block mb-2 text-sm font-medium">Section</label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="w-full px-2 py-1 mb-4 border"
        >
          <option value="hero">Hero</option>
          <option value="promo">Promo</option>
{/* 
          <optgroup label="🛍️ Shop by Category">
            <option value="handbags">Category - Shop Handbags</option>
            <option value="shoes">Category - Shop Shoes</option>
            <option value="watches">Category - Shop Watches</option>
            <option value="accessories">Category - Shop Accessories</option>
            <option value="jewelery">Category - Shop Fine Jewelery</option>
            <option value="clothing">Category - Shop Clothing</option>
          </optgroup> */}

          <option value="banner-1">Banner - 1</option>
          <option value="banner-2">Banner - 2</option>
          <option value="banner-3">Banner - 3</option>

          {/* Add more sections if needed */}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="block w-full mb-4"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default AdminBannerUpload;
