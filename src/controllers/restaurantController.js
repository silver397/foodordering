import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../models/restaurantModel.js';

export const listRestaurants = async (req, res) => {
  try {
    const restaurants = await getAllRestaurants();
    res.json({ restaurants });
  } catch (err) {
    console.error('List restaurants error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ restaurant });
  } catch (err) {
    console.error('Get restaurant error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const addRestaurant = async (req, res) => {
  try {
    const { name, description, address, phone, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }

    const restaurant = await createRestaurant({
      ownerId: req.user.id, // comes from the auth middleware
      name,
      description,
      address,
      phone,
      imageUrl,
    });

    res.status(201).json({ message: 'Restaurant created', restaurant });
  } catch (err) {
    console.error('Create restaurant error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const editRestaurant = async (req, res) => {
  try {
    const existing = await getRestaurantById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Only the owner (or an admin) can edit
    if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not own this restaurant' });
    }

    const { name, description, address, phone, imageUrl, isActive } = req.body;
    const restaurant = await updateRestaurant(req.params.id, {
      name, description, address, phone, imageUrl, isActive,
    });

    res.json({ message: 'Restaurant updated', restaurant });
  } catch (err) {
    console.error('Update restaurant error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const removeRestaurant = async (req, res) => {
  try {
    const existing = await getRestaurantById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (existing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not own this restaurant' });
    }

    await deleteRestaurant(req.params.id);
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    console.error('Delete restaurant error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
