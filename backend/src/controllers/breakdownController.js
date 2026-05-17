import Breakdown from '../models/models.mongodb/breakdown.model.js';

/**
 * Upload a video essay or breakdown element
 * POST /api/breakdowns
 */
export const uploadVideoElement = async (req, res) => {
  try {
    const { title, description, videoUrl, contentType, subCategory, relatedContentId, containsSpoilers } = req.body;

    const newVideo = await Breakdown.create({
      creator: req.user.id, // Populated via Auth Middleware
      title,
      description,
      videoUrl,
      contentType,
      subCategory,
      relatedContentId,
      containsSpoilers
    });

    res.status(201).json({ message: "Creator content published successfully", video: newVideo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Retrieve videos filtered by ContentType (Breakdown vs Video Essay)
 * GET /api/breakdowns?type=Breakdown&page=1
 */
export const getVideosByType = async (req, res) => {
  try {
    const { type, page } = req.query;
    
    if (!['Breakdown', 'Video Essay'].includes(type)) {
      return res.status(400).json({ message: "Invalid content type designation" });
    }

    const videoFeed = await Breakdown.getByType(type, parseInt(page) || 1);
    res.status(200).json(videoFeed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Pull all creator essays/breakdowns tied to a specific Movie or Series ID
 * GET /api/breakdowns/content/:contentId
 */
export const getContentSpecificVideos = async (req, res) => {
  try {
    const videos = await Breakdown.getForContent(req.params.contentId);
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle individual video playback increments and metric updates
 * PATCH /api/breakdowns/:id/view
 */
export const trackVideoView = async (req, res) => {
  try {
    const updatedMetrics = await Breakdown.incrementViews(req.params.id);
    if (!updatedMetrics) return res.status(404).json({ message: "Video not found" });
    
    res.status(200).json({ views: updatedMetrics.viewsCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Like or unlike a specific creator video
 * POST /api/breakdowns/:id/like
 */
export const handleVideoLike = async (req, res) => {
  try {
    const result = await Breakdown.toggleLike(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};