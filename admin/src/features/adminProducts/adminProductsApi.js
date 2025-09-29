import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Ensure base always ends with /api (works with host or "/api")
const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;


export const adminProductsApi = createApi({
  reducerPath: "adminProductsApi",

 baseQuery: fetchBaseQuery({
  baseUrl: BASE,            // <-- was VITE_API_URL or http://.../api
  credentials: "include",
}),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    // GET /products/all?search=&page=&limit=&sortBy=&sortOrder=&category=&subcategory=&brand=&isActive=
    getProducts: builder.query({
      query: (params) => ({ url: "/products/all", params }),
      providesTags: (result) => {
        const list = Array.isArray(result) ? result : result?.items || [];
        return list.length
          ? [
              ...list.map(({ product }) => ({
                type: "Product",
                id: product?._id,
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }];
      },
    }),

    getProductById: builder.query({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation({
      // arg: { id, patch, queryArg }
      query: ({ id, patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted(
        { id, patch, queryArg },
        { dispatch, queryFulfilled }
      ) {
        // optimistic update for the current list view
        const patchResult = dispatch(
          adminProductsApi.util.updateQueryData(
            "getProducts",
            queryArg || {},
            (draft) => {
              const items = Array.isArray(draft) ? draft : draft?.items;
              if (!items) return;
              const idx = items.findIndex((x) => x?.product?._id === id);
              if (idx !== -1) {
                Object.assign(items[idx].product, patch);
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),

    deleteProduct: builder.mutation({
      // arg: { id, queryArg }
      query: ({ id }) => ({ url: `/products/${id}`, method: "DELETE" }),
      async onQueryStarted({ id, queryArg }, { dispatch, queryFulfilled }) {
        // optimistic remove from current list cache
        const patchResult = dispatch(
          adminProductsApi.util.updateQueryData(
            "getProducts",
            queryArg || {},
            (draft) => {
              if (Array.isArray(draft)) {
                const idx = draft.findIndex((x) => x?.product?._id === id);
                if (idx !== -1) draft.splice(idx, 1);
              } else if (draft?.items) {
                draft.items = draft.items.filter((x) => x?.product?._id !== id);
                if (typeof draft.total === "number") {
                  draft.total = Math.max(0, draft.total - 1);
                }
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery, 
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  
} = adminProductsApi;
