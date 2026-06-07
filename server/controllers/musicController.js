const Music = require('../models/Music');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');

class MusicController {
    // Get all music (User view)
    static async getMusic(req, res, next) {
        try {
            const { category } = req.query;
            let filter = { isActive: true };
            if (category) filter.category = category;

            const tracks = await Music.find(filter).sort({ createdAt: -1 });
            res.status(200).json({ success: true, tracks });
        } catch (error) {
            next(error);
        }
    }

    // Search music dynamically via YouTube
    static async searchMusic(req, res, next) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ success: false, message: 'Query is required' });
            }
            
            const r = await ytSearch(query);
            const videos = r.videos.slice(0, 8).map(v => ({
                _id: v.videoId, // Use videoId as _id for frontend compatibility
                title: v.title,
                artist: v.author.name,
                thumbnail: v.thumbnail,
                duration: v.timestamp,
                url: v.url,
                category: query
            }));
            
            res.status(200).json({ success: true, tracks: videos });
        } catch (error) {
            next(error);
        }
    }

    // Stream music dynamically via ytdl-core
    static async streamMusic(req, res, next) {
        try {
            const { url } = req.query;
            if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
            
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                res.header('Content-Type', 'audio/mpeg');
                ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
            } else {
                res.redirect(url);
            }
        } catch (error) {
            console.error('Streaming error:', error);
            res.status(500).end();
        }
    }

    // Admin: Add new music
    static async addMusic(req, res, next) {
        try {
            const { title, category, url, duration } = req.body;
            const track = await Music.create({ title, category, url, duration });
            res.status(201).json({ success: true, track });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Delete/Deactivate
    static async deactivateMusic(req, res, next) {
        try {
            const track = await Music.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            res.status(200).json({ success: true, track });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MusicController;


