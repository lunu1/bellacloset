import { useMemo, useState } from "react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useGetProductByIdQuery, // used in child component
} from "../../features/adminProducts/adminProductsApi";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getDisplayFields } from "../../utils/productDisplay";

export default function ProductsList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [openRows, setOpenRows] = useState(new Set());

  const debouncedSearch = useDebouncedValue(search, 400);

  const queryArg = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      withVariants: "count", // <-- only counts; details load lazily on expand
    }),
    [page, limit, debouncedSearch, sortBy, sortOrder]
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetProductsQuery(queryArg);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const items = useMemo(
    () => (Array.isArray(data) ? data : data?.items || []),
    [data]
  );
  const total = useMemo(() => {
    if (Array.isArray(data)) return data.length;
    return typeof data?.total === "number" ? data.total : items.length;
  }, [data, items]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showClientSlice = Array.isArray(data);
  const pagedItems = showClientSlice
    ? items.slice((page - 1) * limit, page * limit)
    : items;

  const toggleOpen = (id) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search products..."
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
          className="border px-2 py-2 rounded"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-2 py-2 rounded"
        >
          <option value="createdAt">Created</option>
          <option value="name">Name</option>
          <option value="brand">Brand</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-2 py-2 rounded"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button onClick={() => refetch()} className="border px-3 py-2 rounded">
          Refresh
        </button>
        {isFetching && <span className="text-sm text-gray-500">Refreshing…</span>}
      </div>

      {/* Table */}
      {isLoading ? (
        <div>Loading…</div>
      ) : isError ? (
        <div className="text-red-600">
          {error?.data?.message || error?.error || "Failed to load"}
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Name</Th>
                <Th>Image</Th>
                <Th>Brand</Th>
                <Th>Price</Th>
                <Th>Compare</Th>
                <Th>Stock</Th>
                <Th>Variants</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(({ product, variants = [] }) => {
                // variants[] will be empty in count-mode; product.variantCount is set
                const variantCount = product.variantCount ?? variants.length ?? 0;
                const { image, price, compareAtPrice, stock } = getDisplayFields(
                  product,
                  [] // count mode: decide from product only
                );
                const isOpen = openRows.has(product._id);

                return (
                  <FragmentRow key={product._id}>
                    <tr className="border-t">
                      <Td>{product.name}</Td>
                      <Td>
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </Td>
                      <Td>
                        {product.brand || <span className="text-gray-400">—</span>}
                      </Td>
                      <Td>
                        {price != null ? `AED ${price}` : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </Td>
                      <Td>
                        {compareAtPrice ? `AED ${compareAtPrice}` : (
                          <span className="text-gray-400">—</span>
                        )}
                      </Td>
                      <Td>{stock ?? 0}</Td>

                      {/* Variants column: count + Open */}
                      <Td>
                        {variantCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded bg-gray-100 px-2 py-0.5">
                              {variantCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleOpen(product._id)}
                              className="text-blue-600 hover:underline"
                              title="View variant details"
                            >
                              {isOpen ? "Hide" : "Open"}
                            </button>
                          </div>
                        ) : (
                          0
                        )}
                      </Td>

                      <Td className="text-right pr-4">
                        <div className="flex gap-2 justify-end">
                          <a
                            href={`/admin/products/edit/${product._id}`}
                            className="px-2 py-1 border rounded"
                          >
                            Edit
                          </a>
                          <button
                            disabled={isDeleting}
                            onClick={() =>
                              deleteProduct({ id: product._id, queryArg })
                            }
                            className="px-2 py-1 border rounded text-red-600 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>

                    {/* Lazy variant details */}
                    {isOpen && variantCount > 0 && (
                      <tr>
                        <Td colSpan={8} className="bg-gray-50">
                          <VariantDetailsLazy productId={product._id} />
                        </Td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}

              {pagedItems.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-center py-10 text-gray-500">
                    No products found
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantDetailsLazy({ productId }) {
  const { data, isLoading, isError, error } = useGetProductByIdQuery(productId);

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-600">Loading variants…</div>;
  }
  if (isError) {
    return (
      <div className="p-4 text-sm text-red-600">
        {error?.data?.message || "Failed to load variants"}
      </div>
    );
  }

  const variants = data?.variants || [];

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-gray-600">Variant details</div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              <Th>Image</Th>
              <Th>Color</Th>
              <Th>Size</Th>
              <Th>SKU</Th>
              <Th>Price</Th>
              <Th>Compare</Th>
              <Th>Stock</Th>
              <Th>Active</Th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => {
              const color = v.optionValues?.Color ?? "—";
              const size = v.optionValues?.Size ?? "—";
              const img = v.images?.[0];
              return (
                <tr key={v._id} className="border-t">
                  <Td>
                    {img ? (
                      <img
                        src={img}
                        alt={`${color}-${size}`}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>{color}</Td>
                  <Td>{size}</Td>
                  <Td className="font-mono">{v.sku || "—"}</Td>
                  <Td>{v.price != null ? `AED ${v.price}` : "N/A"}</Td>
                  <Td>{v.compareAtPrice ? `AED ${v.compareAtPrice}` : "—"}</Td>
                  <Td>{v.stock ?? 0}</Td>
                  <Td>{v.isActive ? "Yes" : "No"}</Td>
                </tr>
              );
            })}
            {variants.length === 0 && (
              <tr>
                <Td colSpan={8} className="text-center py-6 text-gray-500">
                  No variants
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Small helper to wrap <tr>...<tr> fragments with a stable key:
function FragmentRow({ children }) {
  return <>{children}</>;
}

function Th({ children, className = "" }) {
  return (
    <th className={`text-left font-semibold px-3 py-2 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "", colSpan }) {
  return (
    <td className={`px-3 py-2 align-middle ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
