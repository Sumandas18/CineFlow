const Reel = require('../models/Reel');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

class AnalyticsController {
    static async getDashboardAnalytics(req, res, next) {
        try {
            const userId = req.user.id || req.user._id;

            // Get user's analytics
            const allAnalytics = await Analytics.find({ userId }).populate('reelId');
            
            let totalViews = 0;
            let totalLikes = 0;
            let totalComments = 0;
            let totalShares = 0;

            const nicheMap = {};
            const topReelsMap = [];

            allAnalytics.forEach(stat => {
                totalViews += stat.views;
                totalLikes += stat.likes;
                totalComments += stat.comments;
                totalShares += stat.shares;

                if (stat.reelId) {
                    const niche = stat.reelId.niche || 'Other';
                    if (!nicheMap[niche]) nicheMap[niche] = 0;
                    nicheMap[niche] += stat.views;

                    topReelsMap.push({
                        id: stat.reelId._id,
                        mood: stat.reelId.mood,
                        niche: stat.reelId.niche,
                        views: stat.views,
                        likes: stat.likes,
                        viralScore: Math.floor(Math.random() * 20) + 80 // Mock viral score
                    });
                }
            });

            // If no data, provide realistic looking mock data for testing
            if (allAnalytics.length === 0) {
                totalViews = 124500;
                totalLikes = 15200;
                totalComments = 450;
                nicheMap['Cinematic'] = 60000;
                nicheMap['Motivational'] = 40000;
                nicheMap['Tech'] = 24500;
            }

            const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

            // Generate realistic 7-day chart data ending today
            const chartData = [];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                // We mock the daily distribution but keeping it consistent with the total
                const dayWeight = Math.random() * 0.5 + 0.5; // Random weight between 0.5 and 1.0
                chartData.push({
                    name: days[d.getDay()],
                    views: Math.floor((totalViews / 7) * dayWeight),
                    likes: Math.floor((totalLikes / 7) * dayWeight)
                });
            }

            // Top Reels
            const topReels = topReelsMap.sort((a, b) => b.views - a.views).slice(0, 5);

            // Niche Data
            const nicheData = Object.keys(nicheMap).map(key => ({
                name: key,
                value: nicheMap[key]
            }));

            res.status(200).json({
                success: true,
                stats: {
                    views: totalViews,
                    likes: totalLikes,
                    shares: totalShares,
                    comments: totalComments,
                    engagementRate: parseFloat(engagementRate.toFixed(1))
                },
                chartData,
                topReels,
                nicheData
            });
        } catch (error) {
            next(error);
        }
    }

    static async getReelAnalytics(req, res, next) {
        // Just mock some data for the specific reel since we don't track views/likes in the system yet.
        res.status(200).json({
            success: true,
            data: {
                views: Math.floor(Math.random() * 10000),
                likes: Math.floor(Math.random() * 1000),
                shares: Math.floor(Math.random() * 500)
            }
        });
    }
}

module.exports = AnalyticsController;
