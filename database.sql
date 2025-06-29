create database our_project;

use our_project;

create table users (id int auto_increment PRIMARY KEY, usermail VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL);

show tables;

select * from users;

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_name VARCHAR(50) NOT NULL
);
-- Insert some default accounts
INSERT INTO accounts (account_name) VALUES
('Cash'), ('Card'), ('Savings');

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);
-- Insert some default categories
INSERT INTO categories (category_name) VALUES
('Bill'), ('Beauty'), ('Car'), ('Clothing'), ('Education'), 
('Electronics'), ('Entertainment'), ('Food'), ('Health'), 
('Home'), ('Insurance'), ('Shopping'), ('Social'), ('Sports'), 
('Tax'), ('Telephone/Mobile Bills'), ('Transportation');

select * from categories;

drop table categories;

-- Table for storing transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    category_id INT NOT NULL,
    type_of_transaction ENUM('Income', 'Expense', 'Transfer') NOT NULL,
    notes TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

select * from transactions;

drop table transactions;

CREATE TABLE budget (
    category_id INT,
    monthYear VARCHAR(7),
    user_id INT,
    budget_limit DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (category_id, monthYear, user_id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE categories ADD COLUMN type_of_category ENUM('Income', 'Expense') NOT NULL;

UPDATE categories SET type_of_category = 'Expense' WHERE category_name IN (('Bill'), ('Beauty'), ('Car'), ('Clothing'), ('Education'), 
('Electronics'), ('Entertainment'), ('Food'), ('Health'), 
('Home'), ('Insurance'), ('Shopping'), ('Social'), ('Sports'), 
('Tax'), ('Telephone/Mobile Bills'), ('Transportation'));

select * from categories;

INSERT INTO categories (category_name, type_of_category) VALUES ('Salary','Income'), ('Stipend','Income'), ('Rental Income', 'Income'), ('Bonus', 'Income');
