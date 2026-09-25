import { Router } from 'express';
import {
  estimateRecipients,
  sendMassAlert,
  scheduleMassAlert,
  cancelMassAlert,
  getAlertHistory,
  getDeliveryAnalytics,
  getAlertById,
} from '../controllers/massAlertController';

const router = Router();

// Estimate recipients before sending
router.post('/estimate', estimateRecipients);

// Send immediately
router.post('/send', sendMassAlert);

// Schedule for later
router.post('/schedule', scheduleMassAlert);

// Delivery analytics summary
router.get('/analytics', getDeliveryAnalytics);

// Full history
router.get('/history', getAlertHistory);

// Individual alert (for status polling)
router.get('/:id', getAlertById);

// Cancel a scheduled/pending alert
router.patch('/:id/cancel', cancelMassAlert);

export default router;
