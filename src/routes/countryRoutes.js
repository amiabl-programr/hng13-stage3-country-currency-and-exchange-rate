import express from 'express';
import { getCountries, createCountry, generateStatus, getSpecificCountry, deleteCountry} from '../controllers/countryControllers.js';
import { generateSummaryImage } from '../utils/generateSummaryImage.js';
const router = express.Router();

router.get('/', getCountries);
router.post('/refresh', createCountry);
router.get('/image', generateSummaryImage);
router.get('/status', generateStatus);
router.get('/:name', getSpecificCountry);
router.delete('/:name', deleteCountry);

export default router;