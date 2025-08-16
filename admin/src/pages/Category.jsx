import { useEffect, useState, useRef} from "react";
import axios from "axios";
import { backendURL } from "../config";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";



const Category = () => {
  const [categories, setCategories] = useState([]);
  const [pendingOrder, setPendingOrder] = useState([]); 
  const [label, setLabel] = useState("");
  const [parentId, setParentId] = useState("");
  const [editId, setEditId] = useState(null);
  const [imageFile,setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const fileInputRef = useRef(null);


  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/category`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };


const handleDragEnd = (result) => {
  if (!result.destination) return;

  const reordered = Array.from(categories);
  const [movedItem] = reordered.splice(result.source.index, 1);
  reordered.splice(result.destination.index, 0, movedItem);

  setCategories(reordered);
  setPendingOrder(reordered.map((cat) => cat._id)); // store unsaved order
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
       const formData = new FormData();
       formData.append("label",label);
       if (parentId) formData.append("parent", parentId);
       if (imageFile) formData.append("image", imageFile);


      if (editId) {
        await axios.put(`${backendURL}/api/category/${editId}` ,formData 
        //   {
        //   label,
        //   parent: parentId || null,
         
        // }
            
      );
        alert("Category updated!");
        setEditId(null);
      } else {
        await axios.post(`${backendURL}/api/category`,formData
        //    {
        //   label,
        //   parent: parentId || null,
          
        // }
        
        
      );
        alert("Category created!");
      }
      setLabel("");
      setParentId("");
      setImageFile(null);
      setExistingImage(null);
      fileInputRef.current.value = "";  // ✅ CLEAR file input
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setLabel(cat.label);
    setParentId(cat.parent || "");
    setImageFile(null);
    setExistingImage(cat.image || null);
    fileInputRef.current.value = ""; // clear the actual input field
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

  // const renderCategoryList = (items, level = 0) => {
  //   return items.map((cat) => (
  //     <div key={cat._id} className="ml-4 my-1">
        
  //       <span>{"—".repeat(level)} {cat.label}</span>
  //        {/* Image showing here  */}
         
  //        {cat.image && (
  //               <img
  //                 src={cat.image}
  //                 alt={cat.label}
  //                 className="w-10 h-10 object-cover rounded"
  //               />
  //             )}
              
  //       <button
  //         className="ml-2 text-blue-600"
  //         onClick={() => handleEdit(cat)}
  //       >
  //         Edit
  //       </button>
  //       <button
  //         className="ml-2 text-red-600"
  //         onClick={() => handleDelete(cat._id)}
  //       >
  //         Delete
  //       </button>
  //       {cat.children && cat.children.length > 0 && (
  //         <div className="ml-4">
  //           {renderCategoryList(cat.children, level + 1)}
  //         </div>
  //       )}
  //     </div>
  //   ));
  // };
const renderCategoryList = (items, level = 0) => {
  return items.map((cat) => (
    <div key={cat._id} className={`mb-2 ${level > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-center justify-between p-3 bg-white border rounded">
        <div  className="flex items-center gap-3">
           {/* <span>{"—".repeat(level)}</span> */}
          {cat.image && (
            <img
              src={cat.image}
              alt={cat.label}
              className="w-8 h-8 object-cover rounded"
            />
          )}
          <span>{cat.label}</span>
        </div>
        
        <div >
          <button
            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            onClick={() => handleEdit(cat)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            onClick={() => handleDelete(cat._id)}
          >
            Delete
          </button>
        </div>
      </div>
      
      {cat.children && cat.children.length > 0 && (
        <div className="mt-1">
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

        {/* Image upload Field */}
        <input 
         type="file"
         accept="image/*"
         ref={fileInputRef}
         onChange={(e) => setImageFile (e.target.files[0])}
         className="w-full p-2 border rounded"
         
         />

         {/* ✅ Preview the existing image during edit (if no new file chosen) */}
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
              setImageFile(null);
              setExistingImage(null);
             fileInputRef.current.value = '';
            }}
            className="ml-2 text-sm text-gray-500 underline"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Category List</h3>
        {pendingOrder.length > 0 && (
  <button
    onClick={async () => {
      try {
        await axios.post(`${backendURL}/api/category/reorder`, {
          orderedIds: pendingOrder,
        });
        alert("Order saved!");
        setPendingOrder([]);
        fetchCategories(); // refresh to get real backend order
      } catch (err) {
        alert("Failed to save order");
      }
    }}
    className="mb-4 bg-black text-white px-4 py-2 rounded"
  >
    Save Order
  </button>
)}

       <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="category-list">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {categories.map((cat, index) => (
          <Draggable key={cat._id} draggableId={cat._id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="mb-2"
              >
                <div className="flex items-center justify-between p-3 bg-white border rounded">
                  <div className="flex items-center gap-3">
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <div>
                    <button
                      className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      onClick={() => handleEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Show children without drag for now */}
                {cat.children && cat.children.length > 0 && (
                  <div className="ml-4 mt-2">
                    {renderCategoryList(cat.children, 1)}
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
</DragDropContext>

      </div>
    </div>
  );
};

export default Category;
