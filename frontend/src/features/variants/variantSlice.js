import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import { fetchVariantByProduct} from './variantAPI';

export const getVariantsByProduct = createAsyncThunk(
    'variants/fetchByProduct',
    async (productId) => await fetchVariantByProduct(productId)
);

const variantSlice = createSlice({
    name: 'variants',
    initialState :  {
        items: [],
        selectedVariant: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedVariant: (state, action) => {
            state.selectedVariant= action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getVariantsByProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getVariantsByProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
        })
        .addCase(getVariantsByProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
    },
    
});

export const { setSelectedVariant } = variantSlice.actions;
export default variantSlice.reducer;