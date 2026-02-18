import User from '../models/User.js';
import Bot from '../models/Bot.js';

/**
 * @route   GET /api/users/profile
 * @desc    Get the current user's profile from MongoDB
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update displayName and/or photoURL in MongoDB
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName.trim();
    if (photoURL !== undefined)    updateData.photoURL = photoURL;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

/**
 * @route   GET /api/users/stats
 * @desc    Get aggregate stats for the current user (bot count, queries, tokens)
 * @access  Private
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.uid;

    const bots = await Bot.find({ userId }).lean();

    const totalBots    = bots.length;
    const activeBots   = bots.filter(b => b.status === 'active').length;
    const totalQueries = bots.reduce((s, b) => s + (b.totalQueries || 0), 0);
    const totalTokens  = bots.reduce((s, b) => s + (b.totalTokensUsed || 0), 0);
    const totalCost    = bots.reduce((s, b) => s + (b.estimatedCost || 0), 0);

    res.status(200).json({
      success: true,
      data: { totalBots, activeBots, totalQueries, totalTokens, estimatedCost: totalCost },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

/**
 * @route   DELETE /api/users/account
 * @desc    Delete all user data from MongoDB (bots, user record)
 *          Firebase account deletion happens on the client via Firebase SDK.
 * @access  Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Delete all bots owned by user
    await Bot.deleteMany({ userId });

    // Delete the user record
    await User.findOneAndDelete({ firebaseUid: userId });

    res.status(200).json({ success: true, message: 'Account data deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account data' });
  }
};
