import { Router } from 'express';
import cors from 'cors';
import { requireLoginPage } from '../../middlewares/AuthUserCheckMiddleware';
import { 
    viewQuote, 
    viewQuotesList,
} from './quote.controller';

const router = new Router();

//router.get('/', [requireLoginPage, cors(), viewQuotesList]); MOVE to partner routes
router.get('/:id', [cors(), viewQuote]);
router.get('/:id*', [requireLoginPage, cors(), viewQuote]);
export default router;