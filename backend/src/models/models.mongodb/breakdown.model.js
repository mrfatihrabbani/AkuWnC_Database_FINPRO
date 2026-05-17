import mongoose from 'mongoose';

const breakdownSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true }, // URL pointing to hosted video asset (e.g., Cloudinary, Mux, S3)
  
  // Categorization
  contentType: { 
    type: String, 
    enum: ['Breakdown', 'Video Essay'], 
    required: true 
  },
  subCategory: { 
    type: String, 
    enum: ['Trailer/TV Spot', 'Fight Analysis', 'Character Development', 'Criticism', 'Commentary'], 
    required: true 
  },
  
  // Connections to target Media
  relatedContentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  
  // Content Flags
  containsSpoilers: { type: Boolean, default: false },
  
  // Engagement Metrics
  viewsCount: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

class BreakdownModel {
  /**
   * Fetch latest uploads by type (Breakdown or Video Essay)
   */
  static async getByType(type, page = 1, limit = 10) {
    return this.find({ contentType: type })
      .populate('creator', 'username avatar')
      .populate('relatedContentId', 'title poster year')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  /**
   * Fetch videos focused entirely on a specific Movie or Series
   */
  static async getForContent(contentId) {
    return this.find({ relatedContentId: contentId })
      .populate('creator', 'username avatar')
      .sort({ viewsCount: -1, createdAt: -1 });
  }

  /**
   * Handle video view increments
   */
  static async incrementViews(videoId) {
    return this.findByIdAndUpdate(videoId, { $inc: { viewsCount: 1 } }, { new: true });
  }

  /**
   * Toggle Like for a specific creator video
   */
  static async toggleLike(videoId, userId) {
    const video = await this.findById(videoId);
    if (!video) throw new Error("Video asset not found");

    const hasLiked = video.likes.includes(userId);
    if (hasLiked) {
      video.likes.pull(userId);
    } else {
      video.likes.addToSet(userId);
    }
    
    await video.save();
    return { hasLiked: !hasLiked, totalLikes: video.likes.length };
  }
}

breakdownSchema.loadClass(BreakdownModel);
export default mongoose.model('Breakdown', breakdownSchema);