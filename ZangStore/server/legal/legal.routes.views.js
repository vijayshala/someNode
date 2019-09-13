import express from 'express'
import {
    viewLegalPage,
    viewLegalDocument
} from './legal.controller'

const router = express.Router({mergeParams: true})
router.get('/', [viewLegalPage]);
router.get('/:doc', [viewLegalDocument]);

export default router

