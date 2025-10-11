// src/pages/Category.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { backendURL } from "../config";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const keyOf = (pid) => (pid ? String(pid) : "root");

export default function Category() {
  const [categories, setCategories] = useState([]);
  // { "root": ["id1","id2"], "<parentId>": ["idX","idY"] }
  const [pendingOrder, setPendingOrder] = useState({});
  const [label, setLabel] = useState("");
  const [parentId, setParentId] = useState("");
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/api/category`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ---------- helpers to navigate & update the tree ----------
  const findNode = useCallback((arr, id) => {
    for (const n of arr) {
      if (n._id === id) return n;
      if (n.children?.length) {
        const f = findNode(n.children, id);
        if (f) return f;
      }
    }
    return null;
  }, []);

  const replaceChildren = useCallback((arr, parentId, newChildren) => {
    if (!parentId) return newChildren; // replace root list
    return arr.map((n) => {
      if (n._id === parentId) return { ...n, children: newChildren };
      if (n.children?.length) {
        return { ...n, children: replaceChildren(n.children, parentId, newChildren) };
      }
      return n;
    });
  }, []);

  // ---------- parent options (indented) ----------
  const renderOptions = useCallback(function renderOptions(items, level = 0) {
    return items.flatMap((item) => [
      <option key={item._id} value={item._id}>
        {"—".repeat(level) + " " + item.label}
      </option>,
      ...(item.children ? renderOptions(item.children, level + 1) : []),
    ]);
  }, []);

  // ---------- CRUD ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) return alert("Please enter a category name");

    setIsSubmitting(true);
    setUploadPct(0);

    try {
      const formData = new FormData();
      formData.append("label", label);
      if (parentId) formData.append("parent", parentId);
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);

      const cfg = {
        onUploadProgress: (evt) => {
          if (evt.total) setUploadPct(Math.round((evt.loaded * 100) / evt.total));
        },
      };

      if (editId) {
        await axios.put(`${backendURL}/api/category/${editId}`, formData, cfg);
        alert("Category updated!");
        setEditId(null);
      } else {
        await axios.post(`${backendURL}/api/category`, formData, cfg);
        alert("Category created!");
      }

      setLabel("");
      setParentId("");
      setImageFile(null);
      setExistingImage(null);
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setUploadPct(0);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setLabel(cat.label);
    setParentId(cat.parent || "");
    setImageFile(null);
    setExistingImage(cat.image || null);
    setDescription(cat.description || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  // ---------- DnD: one Droppable per sibling group ----------
  const reorderWithin = useCallback(
    (parentId, sourceIndex, destinationIndex) => {
      const list = parentId ? (findNode(categories, parentId)?.children || []) : categories;
      const next = Array.from(list);
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(destinationIndex, 0, moved);

      const updatedTree = parentId
        ? replaceChildren(categories, parentId, next)
        : next;

      setCategories(updatedTree);
      setPendingOrder((prev) => ({
        ...prev,
        [keyOf(parentId)]: next.map((c) => c._id),
      }));
    },
    [categories, findNode, replaceChildren]
  );

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcPid = source.droppableId.replace("list-", "");
    const dstPid = destination.droppableId.replace("list-", "");

    // keep same-list moves only (safe & simple)
    if (srcPid !== dstPid) return;

    const parentId = srcPid === "root" ? null : srcPid;
    reorderWithin(parentId, source.index, destination.index);
  };

  // ---------- UI rows ----------
  const CategoryRow = ({ cat }) => {
    return (
      <div className="flex items-start justify-between p-3 bg-white border rounded">
        <div className="flex items-start gap-3">
          {cat.image && (
            <img
              src={cat.image}
              alt={cat.label}
              className="w-8 h-8 object-cover rounded mt-0.5"
            />
          )}
          <div>
            <div className="font-medium">{cat.label}</div>
            {cat.description && (
              <div
                className="text-xs text-gray-500 max-w-[520px] overflow-hidden text-ellipsis"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  whiteSpace: "normal",
                }}
              >
                {cat.description}
              </div>
            )}
          </div>
        </div>
        <div className="ml-3 shrink-0">
          <button
            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            onClick={() => handleEdit(cat)}
          >
            Edit
          </button>
          <button
            className="ml-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            onClick={() => handleDelete(cat._id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  // recursive droppable list for siblings of a parent
  const DroppableChildren = ({ parentId, items, level }) => {
    const droppableId = `list-${keyOf(parentId)}`;

    return (
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((cat, idx) => (
              <Draggable key={cat._id} draggableId={cat._id} index={idx}>
                {(p) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    {...p.dragHandleProps}
                    className={`mb-2 ${level > 0 ? "ml-6" : ""}`}
                  >
                    <CategoryRow cat={cat} />

                    {cat.children && cat.children.length > 0 && (
                      <div className="mt-2">
                        <DroppableChildren
                          parentId={cat._id}
                          items={cat.children}
                          level={level + 1}
                        />
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  // Save button visible if any pending order exists
  const hasPending = useMemo(
    () => Object.keys(pendingOrder).length > 0,
    [pendingOrder]
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded shadow">
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

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded min-h-[100px]"
          maxLength={2000}
        />
        <div className="text-xs text-gray-500 text-right">
          {description.length}/2000
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setImageFile(e.target.files[0])}
          className="w-full p-2 border rounded"
        />

        {isSubmitting && imageFile && uploadPct > 0 && (
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className="h-2 bg-black rounded"
                style={{ width: `${uploadPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadPct}%</p>
          </div>
        )}

        {existingImage && !imageFile && (
          <div>
            <p className="text-sm text-gray-500">Current Image:</p>
            <img
              src={existingImage}
              alt="Existing"
              className="w-24 h-24 object-cover rounded mt-2"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? (editId ? "Updating" : "Creating") : editId ? "Update" : "Create"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setLabel("");
                setParentId("");
                setImageFile(null);
                setExistingImage(null);
                setDescription("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sm text-gray-500 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Category List</h3>

          {hasPending && (
            <button
              onClick={async () => {
                try {
                  // convert pendingOrder map into array payload
                  // [{ parent:null, orderedIds:[...] }, { parent:"<id>", orderedIds:[...] }]
                  const orders = Object.entries(pendingOrder).map(([k, ids]) => ({
                    parent: k === "root" ? null : k,
                    orderedIds: ids,
                  }));

                  await axios.post(`${backendURL}/api/category/reorder`, { orders });
                  alert("Order saved!");
                  setPendingOrder({});
                  fetchCategories();
                } catch (err) {
                  alert(err.response?.data?.message || "Failed to save order");
                }
              }}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save Order
            </button>
          )}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* top-level droppable */}
          <DroppableChildren parentId={null} items={categories} level={0} />
        </DragDropContext>
      </div>
    </div>
  );
}
