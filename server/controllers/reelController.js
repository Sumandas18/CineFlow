const Reel = require('../models/Reel');
const Analytics = require('../models/Analytics');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

class ReelController {
    // Generate new reel (starts queue)
    static async createReel(req, res, next) {
        try {
            const { sourceImage, musicId, musicUrl, musicTitle, settings } = req.body;
            
            const plan = req.user.subscription?.plan || 'free';
            if (plan === 'free' && (settings.resolution === '1080p' || settings.resolution === '2K' || settings.resolution === '4K')) {
                return res.status(403).json({ message: 'Upgrade to Pro or Premium to use 1080p and higher.' });
            }
            if (plan === 'pro' && (settings.resolution === '2K' || settings.resolution === '4K')) {
                return res.status(403).json({ message: 'Upgrade to Premium to use 2K/4K resolution.' });
            }

            const reel = await Reel.create({
                user: req.user._id,
                sourceImage,
                music: musicId && musicId.length === 24 ? musicId : undefined,
                musicUrl,
                musicTitle,
                settings
            });

            // Log Analytics
            await Analytics.create({
                type: 'reel_generated',
                user: req.user._id,
                metadata: { resolution: settings.resolution, aspectRatio: settings.aspectRatio }
            });

            res.status(201).json({ success: true, reel });
        } catch (error) {
            next(error);
        }
    }

    // Get user's reels
    static async getUserReels(req, res, next) {
        try {
            const reels = await Reel.find({ user: req.user._id })
                                    .populate('music')
                                    .sort({ createdAt: -1 });
            res.status(200).json({ success: true, reels });
        } catch (error) {
            next(error);
        }
    }

    // Get specific reel status
    static async getReel(req, res, next) {
        try {
            const reel = await Reel.findById(req.params.id).populate('music');
            if (!reel || reel.user.toString() !== req.user._id.toString()) {
                return res.status(404).json({ message: 'Reel not found' });
            }
            res.status(200).json({ success: true, reel });
        } catch (error) {
            next(error);
        }
    }

    // Generate AI Metadata (Captions, Hashtags, Upload Time)
    static async generateAIMetadata(req, res, next) {
        try {
            const reel = await Reel.findById(req.params.id).populate('music');
            if (!reel || reel.user.toString() !== req.user._id.toString()) {
                return res.status(404).json({ message: 'Reel not found' });
            }

            if (reel.aiMetadata && reel.aiMetadata.captions && reel.aiMetadata.captions.length > 0) {
                return res.status(200).json({ success: true, aiMetadata: reel.aiMetadata });
            }

            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            
            const prompt = `You are a social media viral expert. I have generated a cinematic video reel.
Music Category / Name: ${reel.musicTitle || (reel.music ? reel.music.title : 'Cinematic Soundtrack')}
Aspect Ratio: ${reel.settings.aspectRatio}
Resolution: ${reel.settings.resolution}

Generate the following in strict JSON format:
{
  "captions": ["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "bestUploadTime": "e.g., 8:30 PM - 10:00 PM (Local Audience Peak)"
}`;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(jsonStr);

                reel.aiMetadata = {
                    captions: parsed.captions || [],
                    hashtags: parsed.hashtags || [],
                    bestUploadTime: parsed.bestUploadTime || '6:00 PM - 8:00 PM'
                };
            } catch (apiErr) {
                console.error('Gemini API Error:', apiErr.message);
                return res.status(500).json({ success: false, message: `AI failed to generate metadata: ${apiErr.message}` });
            }
            await reel.save();

            res.status(200).json({ success: true, aiMetadata: reel.aiMetadata });
        } catch (error) {
            console.error('AI Metadata Generation Error:', error);
            res.status(500).json({ success: false, message: 'Failed to generate AI metadata' });
        }
    }
}

module.exports = ReelController;
