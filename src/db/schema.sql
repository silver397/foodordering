CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20) NOT NULL DEFAULT 'customer'
                 CHECK (role IN ('customer', 'restaurant_owner', 'admin')),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id           SERIAL PRIMARY KEY,
  owner_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  address      VARCHAR(255),
  phone        VARCHAR(20),
  image_url    VARCHAR(500),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id             SERIAL PRIMARY KEY,
  restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id             SERIAL PRIMARY KEY,
  restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name           VARCHAR(150) NOT NULL,
  description    TEXT,
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url      VARCHAR(500),
  is_available   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id     INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  total_price       NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  delivery_address  VARCHAR(255),
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id   INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  method          VARCHAR(30) NOT NULL DEFAULT 'card'
                  CHECK (method IN ('card','cash','mobile_money','wallet')),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','paid','failed','refunded')),
  transaction_ref VARCHAR(150),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
