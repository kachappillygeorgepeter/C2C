import { Router } from 'express'
import { notificationService } from '../services/notificationService'
import { authenticate } from '../middleware/authenticate'

export const notificationRouter = Router()

notificationRouter.use(authenticate)

notificationRouter.get('/', async (req, res, next) => {
  try {
    const unreadOnly = req.query.unread === 'true'
    const notifications = await notificationService.getUserNotifications(req.user!.userId, unreadOnly)
    res.json({ success: true, data: notifications })
  } catch (err) {
    next(err)
  }
})

notificationRouter.patch('/:id/read', async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user!.userId)
    res.json({ success: true, message: 'Marked as read' })
  } catch (err) {
    next(err)
  }
})

notificationRouter.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId)
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
})
