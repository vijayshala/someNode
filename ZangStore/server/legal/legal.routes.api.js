import express from 'express'
import {
    redirectLegalDoc
} from './legal.controller'

const router = express.Router({mergeParams: true})
router.get('/:doc', [redirectLegalDoc]);

export default router

