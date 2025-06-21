import express from 'express';
import variantController from '../controllers/variantController.js';

const router = express.Router();

router.get('/:id', variantController.getVariantById);
router.put('/:id', variantController.updateVariant);
router.delete('/:id', variantController.deleteVariant);

export default router; 
