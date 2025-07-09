import express from 'express';
import variantController from '../controllers/variantController.js';

const router = express.Router();

router.get('/:id', variantController.getVariantById);
router.put('/:id', variantController.updateVariant);
router.get('/by-product/:productId', variantController.getVariantsByProduct);
router.post('/reduce-stock', variantController.reduceStock); // Endpoint to reduce stock
router.delete('/:id', variantController.deleteVariant);

export default router; 
