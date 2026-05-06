import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Atlas connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

export default connectMongo