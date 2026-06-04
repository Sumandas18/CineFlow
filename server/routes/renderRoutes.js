const express = require('express');
const router = express.Router();
const { renderQueue } = require('../queues/renderQueue');
const AuthMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Middleware to enforce subscription limits
const enforceSubscriptionLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const plan = user.subscription?.plan || 'Starter';
    const resolution = req.body.resolution || '720p';

    if (resolution.includes('1080p') && plan === 'Starter') {
      return res.status(403).json({ success: false, message: 'Upgrade to Pro for 1080p exports.' });
    }
    
    if (resolution.includes('4K') && (plan === 'Starter' || plan === 'Pro')) {
      return res.status(403).json({ success: false, message: 'Upgrade to Elite for 4K exports.' });
    }

    // Example logic for free credits vs paid usage
    if (plan === 'Starter' && user.credits <= 0) {
      return res.status(403).json({ success: false, message: 'Out of free credits. Upgrade to continue rendering.' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// @route POST /api/render/start
router.post('/start', AuthMiddleware.protect, enforceSubscriptionLimits, async (req, res) => {
  try {
    const { layers, resolution, fps, duration } = req.body;
    
    // Add job to BullMQ
    const job = await renderQueue.add('render-reel', {
      layers,
      resolution,
      fps,
      duration,
      userId: req.user.id
    });

    res.status(200).json({ success: true, jobId: job.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to start render job' });
  }
});

// @route GET /api/render/status/:jobId
router.get('/status/:jobId', AuthMiddleware.protect, async (req, res) => {
  try {
    const job = await renderQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    
    let result = null;
    if (state === 'completed') {
      result = job.returnvalue; // Contains { videoUrl }
      
      // Deduct credit if Starter plan
      const user = await User.findById(req.user.id);
      if (user.subscription?.plan === 'Starter' && user.credits > 0) {
         user.credits -= 1;
         await user.save();
      }
    }

    res.status(200).json({
      success: true,
      state, // 'waiting', 'active', 'completed', 'failed'
      progress,
      result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch job status' });
  }
});

module.exports = router;
