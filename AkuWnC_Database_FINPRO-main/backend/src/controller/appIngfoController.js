import AppInfo from '../models/appingfo.model.js';


// Get all App Info and FAQs
// GET /api/app-info
export const getAppDetails = async (req, res) => {
  try {
    const details = await AppInfo.getFullDetails();
    if (!details) {
      return res.status(404).json({ message: "App information not found" });
    }
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 // Update App Info (Admin Only logic)
 // POST /api/app-info
 
export const updateAppDetails = async (req, res) => {
  try {
    // In a real app, you'd check req.user.isAdmin here
    const updated = await AppInfo.updateData(req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};