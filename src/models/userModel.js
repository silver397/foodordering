import { query } from '../config/db.js';

export const createUser = async ({ name, email, passwordHash, phone, role }) => {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'customer'))
     RETURNING id, name, email, phone, role, created_at`,
    [name, email, passwordHash, phone, role]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const updateUserById = async (id, { name, phone }) => {
  const result = await query(
    `UPDATE users
     SET name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, email, phone, role, created_at, updated_at`,
    [name, phone, id]
  );
  return result.rows[0];
};
