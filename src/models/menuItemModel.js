import { query } from '../config/db.js';

export const getMenuByRestaurant = async (restaurantId) => {
  const result = await query(
    `SELECT m.*, c.name AS category_name
     FROM menu_items m
     LEFT JOIN categories c ON m.category_id = c.id
     WHERE m.restaurant_id = $1
     ORDER BY m.created_at DESC`,
    [restaurantId]
  );
  return result.rows;
};

export const getMenuItemById = async (id) => {
  const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
  return result.rows[0];
};

export const createMenuItem = async ({ restaurantId, categoryId, name, description, price, imageUrl }) => {
  const result = await query(
    `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [restaurantId, categoryId, name, description, price, imageUrl]
  );
  return result.rows[0];
};

export const updateMenuItem = async (id, { categoryId, name, description, price, imageUrl, isAvailable }) => {
  const result = await query(
    `UPDATE menu_items
     SET category_id = COALESCE($1, category_id),
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         price = COALESCE($4, price),
         image_url = COALESCE($5, image_url),
         is_available = COALESCE($6, is_available),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [categoryId, name, description, price, imageUrl, isAvailable, id]
  );
  return result.rows[0];
};

export const deleteMenuItem = async (id) => {
  const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};
