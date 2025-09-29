import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';


//Async function to fetch categroies
export const fetchCategories = createAsyncThunk('category/fetch', async () => {
    const response = await axios.get('https://bellaluxurycloset.com/api/category');
    return response.data;
});

//Redux "State Handler"
const categorySlice = createSlice({
    name : "category",
    initialState : {
        items: [], // This will hold the list of categories
        loading:false,
        error:null
    },
    reducers :{},
    
//Handle Async Lifecycle
    extraReducers : (builder) => {
        builder
        .addCase(fetchCategories.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchCategories.fulfilled, (state,action) => {
            state.loading = false;
            state.items = action.payload;
        })
        .addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false ;
            state.error = action.error.message;
        })
    }
});

export default categorySlice.reducer;