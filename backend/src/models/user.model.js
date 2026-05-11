import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    bio:      { type: String, default: '' },
    avatar:   { type: String, default: '' },
    gender:   { type: String, default: '' },
    favoriteGenres: [{ type: String }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

class UserModel {
  static async getProfile(username) {
    return mongoose.model('User').findOne({ username })
      .select('-password')
  }

  static async getManyByUsernames(usernames) {
    return mongoose.model('User').find({ username: { $in: usernames } })
      .select('username bio avatar')
  }

  static async followUser(currentUserId, targetUserId) {
    await mongoose.model('User').findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId }
    })
    await mongoose.model('User').findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    })
  }

  static async unfollowUser(currentUserId, targetUserId) {
    await mongoose.model('User').findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    })
    await mongoose.model('User').findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    })
  }
}

userSchema.loadClass(UserModel)
export default mongoose.model('User', userSchema)