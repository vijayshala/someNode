import logger from 'applogger'
import LegalDocModel from '../models/LegalDocModel'


const ns = '[LegalDocController]'


const LegalDocController = {}



LegalDocController.index = (req, res) => {
    logger.info(req.requestId, ns, '[index]')

    LegalDocModel.getDocs(req, {}, (err, docs) => {
        res.render('legal/LegalIndex', {
            docs
        })
    })        
}


LegalDocController.doc = (req, res) => {
    logger.info(req.requestId, ns, '[doc]')

    LegalDocModel.getDoc(req, {
        slug: req.params.slug
    }, (err, doc) => {
        if(err || !doc) {
            logger.error(req.requestId, ns, '[doc]:error getting doc or doc does not exist');
            res.redirect('/legal');
        } else {
            res.render('legal/LegalDoc', {
                doc
            })
        }        
    })
}




export default LegalDocController