import { Router } from 'express'
const router = Router()

import *as evn from '../controllers/event'


router.post('/createEvent', evn.createEvent)
router.post('/deleteEvent', evn.deleteEvent)
router.post('/updateEvent', evn.updateEvent)

router.post('/updateWods', evn.updateWods)
router.post('/updateResults', evn.updateResults)
router.post('/updateTeams', evn.updateTeams)

router.post('/toggleUpdating', evn.toggleUpdating)

export default router