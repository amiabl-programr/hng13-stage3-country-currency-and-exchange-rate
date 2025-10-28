import express from 'express';
import { generateStatus} from '../controllers/countryControllers.js';

const router = express.Router();


router.get('/status', generateStatus);


export default router;