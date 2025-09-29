import axios from 'axios'


export const fetchVariantByProduct = async (productId) => {
    const res = await axios.get(`https://bellaluxurycloset.com/api/variants/by-product/${productId}`)
    return res.data
}