import express from 'express';
import { getCountries, createCountry, generateStatus} from '../controllers/countryControllers.js';

const router = express.Router();

router.get('/', getCountries);
router.post('/refresh', createCountry);
// router.get('/image', generateImage);
router.get('/status', generateStatus);
// router.delete('/:name', deleteCountry);
// router.delete('/:name', getSpecificCountry);

export default router;