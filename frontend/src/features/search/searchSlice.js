import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    search: " ",
    showSearch:false,
}

const searchSlice = createSlice({
    name: "search" ,
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setShowsearch: (state, action) => {
            state.showSearch = action.payload;
        },
        clearSearch: (state) => {
            state.search = " ";
            state.showSearch = false;

        }
    }
});


export const { setSearch, setShowsearch, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;