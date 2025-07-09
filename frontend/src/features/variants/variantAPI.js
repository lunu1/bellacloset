import axios from 'axios'


export const fetchVariantByProduct = async (productId) => {
    const res = await axios.get(`http://localhost:4000/api/variants/by-product/${productId}`)
    return res.data
}