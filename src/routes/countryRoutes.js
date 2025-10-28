import express from 'express';
import { getCountries, createCountry, generateStatus, getSpecificCountry, deleteCountry, generateSummaryImage} from '../controllers/countryControllers.js';

const router = express.Router();

router.get('/', getCountries);
router.post('/refresh', createCountry);
router.get('/image', generateSummaryImage);
router.get('/status', generateStatus);
router.get('/:name', getSpecificCountry);
router.delete('/:name', deleteCountry);

export default router;