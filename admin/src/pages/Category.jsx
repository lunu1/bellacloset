import { useEffect, useState } from "react";
import axios from "axios";
import { backendURL } from "../config";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [label, setLabel] = useState("");
  const [parentId, setParentId] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/category`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderOptions = (items, level = 0) => {
    return items.flatMap((item) => [
      <option key={item._id} value={item._id}>
        {"—".repeat(level) + " " + item.label}
      </option>,
      ...(item.children ? renderOptions(item.children, level + 1) : []),
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) return alert("Please enter a category name");

    try {
      if (editId) {
        await axios.put(`${backendURL}/api/category/${editId}`, {
          label,
          parent: parentId || null,
        });
        alert("Category updated!");
        setEditId(null);
      } else {
        await axios.post(`${backendURL}/api/category`, {
          label,
          parent: parentId || null,
        });
        alert("Category created!");
      }
      setLabel("");
      setParentId("");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setLabel(cat.label);
    setParentId(cat.parent || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${backendURL}/api/category/${id}`);
      alert("Category deleted");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const renderCategoryList = (items, level = 0) => {
    return items.map((cat) => (
      <div key={cat._id} className="ml-4 my-1">
        <span>{"—".repeat(level)} {cat.label}</span>
        <button
          className="ml-2 text-blue-600"
          onClick={() => handleEdit(cat)}
        >
          Edit
        </button>
        <button
          className="ml-2 text-red-600"
          onClick={() => handleDelete(cat._id)}
        >
          Delete
        </button>
        {cat.children && cat.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryList(cat.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        {editId ? "Edit Category" : "Create Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">No Parent (Top-level)</option>
          {renderOptions(categories)}
        </select>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {editId ? "Update" : "Create"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setLabel("");
              setParentId("");
            }}
            className="ml-2 text-sm text-gray-500 underline"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Category List</h3>
        {renderCategoryList(categories)}
      </div>
    </div>
  );
};

export default Category;
