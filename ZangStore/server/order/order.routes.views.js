import express from 'express'
import cors from 'cors'
import {requireLoginPage} from '../../middlewares/AuthUserCheckMiddleware';
import { viewOrder, viewOrdersList } from './order.controller'
import BaseController from '../../controllers/BaseController'


const orderViewRouter = express.Router()
// orderViewRouter.get('/filter', cors(), viewerOrdersByCategory);
orderViewRouter.get('/', [requireLoginPage, cors(), BaseController.authorizeAdmin, viewOrdersList]);
orderViewRouter.get('/:slug', [requireLoginPage, cors(), viewOrder]);
export default orderViewRouter