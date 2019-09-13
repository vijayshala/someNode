const ns = '[quote.routes.api]'
import { Router } from 'express';
import logger from 'applogger'
import { requireLoginApi } from '../../middlewares/AuthUserCheckMiddleware';
import BaseController from '../../controllers/BaseController'
import constants from '../../config/constants';
import { 
    getQuote,
    createQuote,
    deleteQuote
} from './quote.controller';

const hasAccessToPP = (req, res, next) => {
    if (req.partnerInfo) {
        if (req.userInfo.accessLevel <= constants.USER_LEVELS.ADMIN) {
            logger.info(req.requestId, ns, '[hasAccessToPP]:isADMIN')
            next()
        } else {
            let partner = req.partnerInfo.filter(p => {
                return p._id.toString() === req.params.id
            })[0]
            logger.info(req.requestId, ns, '[hasAccessToPP]:partner', JSON.stringify(partner))
            if (partner && partner.agent.accessLevel <= constants.AGENT_LEVELS.ADMIN) {
                logger.info(req.requestId, ns, '[hasAccessToPP]:isOWNER')
                next()
            } else {
                //check child company
                let child = req.partnerInfo.filter(p => {
                    return p.children.indexOf(req.params.id) > -1
                })[0]

                if (child) {
                    next()
                } else {
                    logger.info(req.requestId, ns, '[hasAccessToPP]:home')
                    res.redirect('/')
                }
            }
        }
    } else {
        return BaseController.authorizeAdmin(req, res, next)
    }
};

const router = new Router();

router.get('/:id', [getQuote]);
router.post('/', [requireLoginApi,  createQuote]);
router.delete('/:id', [requireLoginApi, deleteQuote]);

export default router;