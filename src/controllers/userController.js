import { findUserById, updateUserById } from '../models/userModel.js';

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name && !phone) {
      return res.status(400).json({ error: 'Provide at least name or phone to update' });
    }

    const user = await updateUserById(req.user.id, { name, phone });
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
