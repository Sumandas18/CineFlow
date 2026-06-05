const Reel = require('../models/Reel');
const socket = require('../config/socket');
const Analytics = require('../models/Analytics');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => { file.close(resolve); });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function downloadYoutubeAudio(url, dest) {
    return new Promise((resolve, reject) => {
        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
        const file = fs.createWriteStream(dest);
        stream.pipe(file);
        file.on('finish', () => { file.close(resolve); });
        stream.on('error', reject);
    });
}

class QueueService {
    constructor() {
        this.isProcessing = false;
        // Start polling loop
        setInterval(() => this.processQueue(), 5000);
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const reel = await Reel.findOne({ status: 'pending' }).populate('user').populate('music');
            if (!reel) {
                this.isProcessing = false;
                return;
            }


            reel.status = 'processing';
            await reel.save();

            const io = socket.getIO();
            io.emit('reelStatusUpdate', { reelId: reel._id, status: 'processing', progress: 0 });

            const tmpDir = path.join(os.tmpdir(), 'creatoros_reels');
            fs.ensureDirSync(tmpDir); // Create temp folder if missing

            const imagePath = path.join(tmpDir, `img_${reel._id}.jpg`);
            const audioPath = path.join(tmpDir, `aud_${reel._id}.mp3`);
            const outPath = path.join(tmpDir, `out_${reel._id}.mp4`);

            try {
                // 1. Download image


                await downloadFile(reel.sourceImage, imagePath);

                if (!fs.existsSync(imagePath) || fs.statSync(imagePath).size === 0) {
                    throw new Error('Downloaded source image is missing or empty.');
                }
                
                // 2. Download audio
                const finalAudioUrl = reel.musicUrl || (reel.music ? reel.music.url : null);
                let hasAudio = false;
                
                if (finalAudioUrl) {

                    try {
                        if (finalAudioUrl.includes('youtube.com') || finalAudioUrl.includes('youtu.be')) {
                            await downloadYoutubeAudio(finalAudioUrl, audioPath);
                        } else {
                            await downloadFile(finalAudioUrl, audioPath);
                        }

                        if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size === 0) {
                            throw new Error('Downloaded soundtrack is missing or empty.');
                        }
                        hasAudio = true;
                    } catch (audioErr) {
                        throw new Error(`Failed to download required soundtrack: ${audioErr.message}`);
                    }
                } else {
                    throw new Error('No soundtrack provided for the cinematic reel.');
                }

                // 3. Dynamic Resolution and Aspect Ratio Mapping
                const { resolution = '1080p', aspectRatio = '9:16', fps = 30, bitrate = 'medium' } = reel.settings;
                
                // Base dimensions for 1080p
                let baseW = 1080, baseH = 1920;
                if (aspectRatio === '16:9') { baseW = 1920; baseH = 1080; }
                else if (aspectRatio === '1:1') { baseW = 1080; baseH = 1080; }
                else if (aspectRatio === '4:5') { baseW = 1080; baseH = 1350; }

                // Scale factor based on resolution
                let scale = 1;
                if (resolution === '720p') scale = 720/1080;
                else if (resolution === '2K') scale = 1440/1080;
                else if (resolution === '4K') scale = 2160/1080;

                // Ensure even dimensions (required by h264)
                const finalW = Math.round((baseW * scale) / 2) * 2;
                const finalH = Math.round((baseH * scale) / 2) * 2;

                // Bitrate mapping
                const videoBitrate = bitrate === 'high' ? '8000k' : bitrate === 'low' ? '2500k' : '5000k';

                // Check Subscription for Watermark
                const plan = reel.user?.subscription?.plan || 'free';
                const needsWatermark = plan === 'free';




                // 4. Render video via FFmpeg
                await new Promise((resolve, reject) => {
                    let cmd = ffmpeg().input(imagePath).loop(1);
                        
                    // Build complex filter for scaling/cropping and optional zoompan
                    let vfFilter = `scale=${finalW}:${finalH}:force_original_aspect_ratio=increase,crop=${finalW}:${finalH}`;
                    
                    if (!hasAudio) {
                        // Apply a subtle zoompan if no audio to make it cinematic
                        vfFilter += `,zoompan=z='min(zoom+0.0015,1.5)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${finalW}x${finalH}`;
                    }

                    if (needsWatermark) {
                        // Add watermark text to bottom right
                        vfFilter += `,drawtext=text='Made with CreatorOS AI':fontcolor=white@0.7:fontsize=24:x=w-tw-20:y=h-th-20:box=1:boxcolor=black@0.4:boxborderw=5`;
                    }

                    cmd = cmd.outputOptions([
                        '-t 10', // 10 sec duration
                        '-pix_fmt yuv420p',
                        `-vf ${vfFilter}`,
                        `-r ${fps}`,
                        `-b:v ${videoBitrate}`,
                        '-preset fast' // safe preset
                    ]);
                        
                    if (hasAudio && fs.existsSync(audioPath)) {
                        cmd = cmd.input(audioPath).outputOptions(['-c:v libx264', '-c:a aac', '-shortest']);
                    } else {
                        cmd = cmd.outputOptions(['-c:v libx264']);
                    }

                    cmd.on('progress', async (p) => {
                        const progress = Math.min(Math.floor(p.percent || 0), 90);
                        reel.progress = progress;
                        await reel.save();
                        io.emit('reelStatusUpdate', { reelId: reel._id, status: 'processing', progress });
                    })
                    .on('end', resolve)
                    .on('error', (err, stdout, stderr) => {
                        console.error('[QueueService] FFmpeg Stderr:', stderr);
                        reject(err);
                    })
                    .save(outPath);
                });

                // 5. Upload to Cloudinary

                io.emit('reelStatusUpdate', { reelId: reel._id, status: 'processing', progress: 95 });
                const uploadRes = await cloudinary.uploader.upload(outPath, { resource_type: "video", folder: "creatoros_reels" });
                
                reel.status = 'completed';
                reel.progress = 100;
                reel.videoUrl = uploadRes.secure_url;
                await reel.save();
                
                io.emit('reelStatusUpdate', { 
                    reelId: reel._id, 
                    status: 'completed', 
                    progress: 100, 
                    videoUrl: reel.videoUrl,
                    audioUrl: finalAudioUrl
                });

                // Cleanup
                fs.removeSync(imagePath);
                if (hasAudio) fs.removeSync(audioPath);
                fs.removeSync(outPath);

                // Log Analytics
                await Analytics.create({
                    type: 'export_completed',
                    user: reel.user._id,
                    metadata: { resolution, aspectRatio }
                });

                const totalExports = await Reel.countDocuments({ status: 'completed' });
                io.emit('analyticsUpdate', { metric: 'totalExports', value: totalExports });


            } catch (renderError) {
                console.error('[QueueService] Full Render Error:', renderError);
                reel.status = 'failed';
                reel.errorMessage = renderError.message;
                await reel.save();
                io.emit('reelStatusUpdate', { reelId: reel._id, status: 'failed', error: renderError.message || 'Generation failed' });
                
                // Cleanup on error
                fs.removeSync(imagePath);
                fs.removeSync(audioPath);
                fs.removeSync(outPath);
            }

            this.isProcessing = false;
            this.processQueue();

        } catch (err) {
            console.error('[QueueService] Fatal Queue Error:', err);
            this.isProcessing = false;
        }
    }
}

module.exports = new QueueService();
