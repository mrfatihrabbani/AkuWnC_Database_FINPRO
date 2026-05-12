import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['NEW_FOLLOWER', 'RECOMMENDATION', 'TAGGED'], 
    required: true 
  },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, 
  createdAt: { type: Date, default: Date.now }
});

class NotificationModel {
  static async getLatestForHeader(userId) {
    return this.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(10);
  }

  static async addNotification(data) {
    return this.create(data);
  }

  static async clearAll(userId) {
    return this.deleteMany({ recipientId: userId });
  }
}

notificationSchema.loadClass(NotificationModel);
export default mongoose.model('Notification', notificationSchema);