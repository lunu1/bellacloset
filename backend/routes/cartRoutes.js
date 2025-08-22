import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart,setCartQuantity} from '../controllers/cartController.js';
import userAuth from '../middlewares/userAuth.js';


const router = express.Router();

router.post('/add',userAuth, addToCart);
router.get('/',userAuth, getCart);
router.post('/remove',userAuth, removeFromCart);
router.delete('/clear',userAuth, clearCart);
router.patch('/update',userAuth, setCartQuantity);


export default router