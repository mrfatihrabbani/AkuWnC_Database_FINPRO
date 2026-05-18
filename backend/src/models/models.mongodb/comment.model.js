import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
  user: { type: String, required: true },
  text: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
