import { query } from '../config/db.js';

export const getAllRestaurants = async () => {
  const result = await query(
    'SELECT * FROM restaurants WHERE is_active = true ORDER BY created_at DESC'
  );
  return result.rows;
};

export const getRestaurantById = async (id) => {
  const result = await query('SELECT * FROM restaurants WHERE id = $1', [id]);
  return result.rows[0];
};

export const createRestaurant = async ({ ownerId, name, description, address, phone, imageUrl }) => {
  const result = await query(
    `INSERT INTO restaurants (owner_id, name, description, address, phone, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [ownerId, name, description, address, phone, imageUrl]
  );
  return result.rows[0];
};

export const updateRestaurant = async (id, { name, description, address, phone, imageUrl, isActive }) => {
  const result = await query(
    `UPDATE restaurants
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         address = COALESCE($3, address),
         phone = COALESCE($4, phone),
         image_url = COALESCE($5, image_url),
         is_active = COALESCE($6, is_active),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [name, description, address, phone, imageUrl, isActive, id]
  );
  return result.rows[0];
};

export const deleteRestaurant = async (id) => {
  const result = await query('DELETE FROM restaurants WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};
