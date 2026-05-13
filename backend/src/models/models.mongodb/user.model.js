import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    bio:      { type: String, default: '' },
    avatar:   { type: String, default: '' },
    gender:   { type: String, default: '' },
    favoriteGenres: [{ type: String }],
    theme:    { type: String, default: 'oscars' },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

class UserModel {
  static async registerUser(userData) {
    return await this.create(userData)
  }

  static async findByEmail(email) {
    return await this.findOne({ email })
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
  }


  static async getProfile(username) {
    return mongoose.model('User').findOne({ username })
      .select('-password')
  }

  static async getManyByUsernames(usernames) {
    return mongoose.model('User').find({ username: { $in: usernames } })
      .select('username bio avatar')
  }

  static async toggleTheme(userId) {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");
    user.theme = user.theme === 'oscars' ? 'nature' : 'oscars';
    await user.save();
    return user.theme;
  }

}

userSchema.loadClass(UserModel)
export default mongoose.model('User', userSchema)