import User from '../models/models.mongodb/user.model.js';

// Register Controller
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await User.registerUser({
      username,
      email,
      password
    });

    res.status(201).json({ 
      message: "User created", 
      userId: newUser._id 
    });
  } catch (error) {
    // Handled duplicate keys or validation errors from MongoDB
    res.status(400).json({ error: error.message });
  }
};


//  Logic: Uses User.findByEmail (static) * and user.comparePassword (instance method).
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use the model's static method to find the user
    const user = await User.findByEmail(email);

    // Check if user exists and use the model's instance method to verify password
    if (user && (await user.comparePassword(password))) {
      res.status(200).json({ 
        message: "Login successful", 
        user: { 
          username: user.username, 
          id: user._id 
        } 
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};