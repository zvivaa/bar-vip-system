CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    role SMALLINT NOT NULL
);

CREATE TABLE refresh_sessions(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(400) NOT NULL,
    finger_print VARCHAR(32) NOT NULL
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    number_of_people INTEGER NOT NULL,
    table_id INTEGER NOT NULL
);


SELECT * FROM users;
SELECT * FROM refresh_sessions;
SELECT * FROM reservations;