import { query } from '../config/db.js';

export const createCategory = async ({ restaurantId, name }) => {
  const result = await query(
    `INSERT INTO categories (restaurant_id, name) VALUES ($1, $2) RETURNING *`,
    [restaurantId, name]
  );
  return result.rows[0];
};

export const getCategoriesByRestaurant = async (restaurantId) => {
  const result = await query(
    'SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY name',
    [restaurantId]
  );
  return result.rows;
};
