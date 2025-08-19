// src/pages/admin/ProductEdit.jsx
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "../../features/adminProducts/adminProductsApi";
import ProductUpdateForm from "../../components/ProductUpdateForm";
import axios from "axios";

export default function ProductEdit() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError) return (
    <div className="p-6 text-red-600">
      {error?.data?.message || "Failed to load product."}
      <button onClick={() => refetch()} className="ml-3 underline">Retry</button>
    </div>
  );

  const { product, variants = [] } = data || {};

  const handleSubmit = async ({ productPatch, variantsPayload }) => {
    // 1) Update product document
    await updateProduct({ id, patch: productPatch, queryArg: {} }).unwrap();
    // 2) OPTIONAL: Replace/update variants (needs backend endpoint)
    if (Array.isArray(variantsPayload)) {
      try {
        // Option A: replace all variants in one call (recommended backend route)
        await axios.put(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/products/${id}/variants`,
          { variants: variantsPayload }
        );
      } catch (err) {
        // If you haven't added that route yet, this will 404 — just inform the user
        console.warn("Variant replace API missing:", err?.response?.status);
        toast.info("Product updated. To update variants, add PUT /products/:id/variants backend.");
      }
    }
    toast.success("Product updated");
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <ProductUpdateForm
        initialProduct={product}
        initialVariants={variants}
        onSubmit={handleSubmit}
        submitting={isUpdating}
      />
    </div>
  );
}
