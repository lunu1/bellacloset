import axios from "axios"
import { useEffect, useState } from "react"

export default function ShopbyCategory() {

    const [categories, setCategories] = useState([]);

    const categorySlugs = [
        "handbags",
        "shoes",
        "watches",
        "accessories",
        "jewelery",
        "clothing",
    ];

  //function to fetch categories
   useEffect(() => {
       const fetchCategories = async () => {
           try {
            const request = categorySlugs.map(async (slug) =>{
               const res = await axios.get(`http://localhost:4000/api/banner/${slug}`);
               return {
                id: res.data._id,
                name:res.data.section.toUpperCase(),
                image:res.data.imageUrl,
                alt:`${res.data.section} banner`
               }

               });
               const results = await Promise.all(request);
               setCategories(results);

     
           }catch (error) {
               console.error("Failed to fetch categories", error);
           }
       };
       fetchCategories();
   }, []); 

    return (
        <div className="container mx-auto py-8">

            <div className="bg-gray-100 py-2 mb-8">
            <h2 className="text-center text-sm font-normal text-gray-800">SHOP BY CATEGORIES</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">


       {categories.map((category) =>(
        <div key={category.id} className="relative group cursor-pointer">
            <div className="relative overflow-hidden bg-gray-200">
                <img 
                src={category.image} 
                alt={category.alt} 
                className="w-full h-full object-cover"
                />
            </div>
        </div>
    )

    )
}
            </div>

        </div>
    )
}