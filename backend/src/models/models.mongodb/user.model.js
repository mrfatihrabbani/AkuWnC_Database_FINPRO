import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    bio:      { type: String, default: '' },
    avatar:   { type: String, default: '' },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

class UserModel {
  // AUTH METHODS
  // Static method to register a user
  static async registerUser(userData) {
    return await this.create(userData)
  }

  // find user by email for login 
  static async findByEmail(email) {
    return await this.findOne({ email })
  }

// User.comparePassword
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
  }


  //PROFILE METHODS
  static async getProfile(username) {
    return mongoose.model('User').findOne({ username })
      .select('-password')
  }

  static async getManyByUsernames(usernames) {
    return mongoose.model('User').find({ username: { $in: usernames } })
      .select('username bio avatar')
  }

  // Toggle between Oscars and Nature mode
  static async toggleTheme(userId) {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");

    // Simple toggle logic
    user.theme = user.theme === 'oscars' ? 'nature' : 'oscars';
    await user.save();
    return user.theme;
  }

}

userSchema.loadClass(UserModel)
export default mongoose.model('User', userSchema)