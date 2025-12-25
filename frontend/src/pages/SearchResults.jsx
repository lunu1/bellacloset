import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchResults } from "../features/search/searchSlice";
import { useLocation } from "react-router-dom";


const SearchResults = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const query = new URLSearchParams(location.search).get("q")?.trim() || "";

  const { results = [], loading, error } = useSelector((state) => state.search);

  useEffect(() => {
    if (query) {
      dispatch(fetchSearchResults(query));
    }
  }, [query, dispatch]);

 

  return (
    <div className="container mx-auto px-4 py-8">
     
      <h1 className="text-2xl font-normal mb-4">Search Results for "{query}"</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && results.length === 0 && (
        <p className="text-gray-600">No results found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((item) => (
          <div key={item._id} className="border rounded-lg p-4 shadow-sm">
            <img
              src={item.images?.[0] || "/placeholder.png"}
              alt={item.name}
              className="w-full h-48 object-cover mb-2 rounded"
            />
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-sm text-gray-600">{item.brand}</p>
            <p className="text-sm text-gray-500 truncate">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
