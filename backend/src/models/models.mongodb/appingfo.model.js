import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' }
});

const appInfoSchema = new mongoose.Schema({
  aboutText: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  contactEmail: { type: String },
  faqs: [faqSchema] 
}, { timestamps: true });

class AppInfoModel {
// Fetch the main app information and FAQ list
  static async getFullDetails() {
    return this.findOne();
  }

  // Static method to initialize or update the info (Admin use)
  static async updateData(updateObj) {
    return this.findOneAndUpdate({}, updateObj, { 
      upsert: true, 
      new: true 
    });
  }
}

appInfoSchema.loadClass(AppInfoModel);
export default mongoose.model('AppInfo', appInfoSchema);