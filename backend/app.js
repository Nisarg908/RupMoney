const express = require("express");
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json()); // to parse JSON bodies
app.use(cors());

// Database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root#123",
    database: "our_project"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
});

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret_key";//Ensure that the JWT_SECRET is stored securely in production (e.g., in environment variables).

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Extract the Authorization header
    if (!authHeader) return res.status(403).json({ error: "No token provided" });

    const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"

    if (!token) return res.status(403).json({ error: "Invalid token format" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};


// Register route
app.post('/register', (req, res) => {
    const { usermail, password } = req.body;
    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => { //The 10 is the salt rounds parameter for the bcrypt.hash function.
        if (err) throw err;

        const query = 'INSERT INTO users (usermail, password) VALUES (?, ?)';
        con.query(query, [usermail, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Registration failed" });
            }

            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

// // Login route
// app.post('/login', (req, res) => {
//     const { usermail, password } = req.body;

//     const query = 'SELECT * FROM users WHERE usermail = ?';
//     con.query(query, [usermail], (err, result) => {
//         if (err) throw err;
//         if (result.length === 0) {
//             return res.status(401).json({ error: "Invalid credentials" });
//         }

//         const user = result[0];
//         bcrypt.compare(password, user.password, (err, isMatch) => {
//             if (err) throw err;
//             if (!isMatch) {
//                 return res.status(401).json({ error: "Invalid credentials" });
//             }

//             const token = jwt.sign({ id: user.id, usermail: user.usermail }, JWT_SECRET, { expiresIn: '1h' });
//             res.json({ token });
//         });
//     });
// });
// Login route
app.post('/login', (req, res) => {
    const { usermail, password } = req.body;
    const query = 'SELECT * FROM users WHERE usermail = ?';
    con.query(query, [usermail], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Issue a new token on every login
            const token = jwt.sign({ id: user.id, usermail: user.usermail }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});


// Endpoint to fetch accounts and categories
app.get('/get-metadata', authenticateToken, (req, res) => {
    const queries = [
        "SELECT * FROM accounts",
        "SELECT * FROM categories"
    ];

    Promise.all(queries.map(query => new Promise((resolve, reject) => {
        con.query(query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    })))
        .then(([accounts, categories]) => {
            res.json({ accounts, categories });
        })
        .catch(err => res.status(500).json({ error: "Failed to fetch data" }));
});

// Endpoint to save a transaction
// app.post('/save-transaction', authenticateToken, (req, res) => {
//     const userId = req.user.id;
//     const { type_of_transaction, account_id, category_id, notes, amount, transaction_date, transaction_time } = req.body;

//     const query = `INSERT INTO transactions_user_${userId} 
//         (type_of_transaction, account_id, category_id, notes, amount, transaction_date, transaction_time)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`;

//     con.query(query, [type_of_transaction, account_id, category_id, notes, amount, transaction_date, transaction_time], (err, result) => {
//         if (err) return res.status(500).json({ error: "Failed to save transaction" });
//         res.status(201).json({ message: "Transaction saved successfully" });
//     });
// });
app.post('/save-transaction', authenticateToken, (req, res) => {
    const { account_id, category_id, type_of_transaction, notes, amount, transaction_date, transaction_time } = req.body;
    const userId = req.user.id; // assuming req.user is set by authenticateToken middleware
    
    const query = `
      INSERT INTO transactions (user_id, account_id, category_id, type_of_transaction, notes, amount, transaction_date, transaction_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    con.query(query, [userId, account_id, category_id, type_of_transaction, notes, amount, transaction_date, transaction_time], (err, results) => {
        if (err) {
            res.status(500).json({ message: "Error saving transaction", error: err });
        } else {
            res.status(201).json({ message: "Transaction saved successfully" });
        }
    });
});

// Endpoint to fetch transactions for the logged-in user
// app.get('/get-transactions', authenticateToken, (req, res) => {
//     const userId = req.user.id;

//     const query = `SELECT t.*, a.account_name, c.category_name FROM transactions_user_${userId} t
//                   JOIN accounts a ON t.account_id = a.id
//                   JOIN categories c ON t.category_id = c.id
//                   ORDER BY t.transaction_date DESC, t.transaction_time DESC`;

//     con.query(query, (err, transactions) => {
//         if (err) return res.status(500).json({ error: "Failed to fetch transactions" });
//         res.json(transactions);
//     });
// });
// app.get('/get-transactions', authenticateToken, (req, res) => {
//     const userId = req.user.id; // assuming req.user is set by authenticateToken middleware
//     const query = `
//       SELECT transactions.id, transactions.type_of_transaction, transactions.notes, 
//              transactions.amount, 
//              DATE_FORMAT(transactions.transaction_date, '%Y-%m-%d') as transaction_date, 
//              TIME_FORMAT(transactions.transaction_time, '%H:%i:%s') as transaction_time, 
//              accounts.account_name, categories.category_name
//       FROM transactions
//       JOIN accounts ON transactions.account_id = accounts.id
//       JOIN categories ON transactions.category_id = categories.id
//       WHERE transactions.user_id = ?;
//     `;
//     con.query(query, [userId], (err, results) => {
//       if (err) {
//         res.status(500).json({ message: "Error retrieving transactions", error: err });
//       } else {
//         res.json(results);
//       }
//     });
//   });

app.get('/get-transactions', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const monthYear = req.query.monthYear;

    let query = `
      SELECT transactions.id, transactions.type_of_transaction, transactions.notes, 
             transactions.amount, 
             DATE_FORMAT(transactions.transaction_date, '%Y-%m-%d') as transaction_date, 
             TIME_FORMAT(transactions.transaction_time, '%H:%i:%s') as transaction_time, 
             accounts.account_name, categories.category_name
      FROM transactions
      JOIN accounts ON transactions.account_id = accounts.id
      JOIN categories ON transactions.category_id = categories.id
      WHERE transactions.user_id = ?
    `;

    const queryParams = [userId];

    if (monthYear) {
        query += ` AND DATE_FORMAT(transactions.transaction_date, '%Y-%m') = ?`;
        queryParams.push(monthYear);
    }

    con.query(query, queryParams, (err, results) => {
        if (err) {
            res.status(500).json({ message: "Error retrieving transactions", error: err });
        } else {
            res.json(results);
        }
    });
});

// Delete a transaction
app.delete('/delete-transaction/:id', authenticateToken, (req, res) => {
    const transactionId = req.params.id;

    const query = 'DELETE FROM transactions WHERE id = ? AND user_id = ?';
    con.query(query, [transactionId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to delete transaction" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    });
});

app.get('/get-category-summary', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { monthYear, type_of_transaction } = req.query;

    if (!monthYear || !type_of_transaction) {
        console.log("Month/Year and transaction type are required");
        return res.status(400).json({ message: "Month/Year and transaction type are required" });
    }

    const query = `
        SELECT categories.category_name, SUM(transactions.amount) as total_amount
        FROM transactions
        JOIN categories ON transactions.category_id = categories.id
        WHERE transactions.user_id = ? 
          AND transactions.type_of_transaction = ? 
          AND DATE_FORMAT(transactions.transaction_date, '%Y-%m') = ?
        GROUP BY categories.category_name
    `;

    con.query(query, [userId, type_of_transaction, monthYear], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving category summary", error: err });
        }
        console.log(results);
        res.json(results);
    });
});

app.get('/get-unused-categories', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const monthYear = req.query.monthYear;

    const query = `
        SELECT c.id AS category_id, c.category_name
        FROM categories c
        WHERE c.id NOT IN (
            SELECT b.category_id
            FROM budget b
            WHERE b.user_id = ?
            AND b.monthYear = ?
        );
    `;

    con.query(query, [userId, monthYear], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error retrieving unused categories", error: err });
        }
        console.log("Success");
        res.json(results);
    });
});

app.post('/add-budget', authenticateToken, (req, res) => {
    const { category_id, monthYear, budget_limit } = req.body;
    const userId = req.user.id;

    const query = `
        INSERT INTO budget (category_id, monthYear, user_id, budget_limit)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE budget_limit = ?;
    `;

    con.query(query, [category_id, monthYear, userId, budget_limit, budget_limit], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error adding/updating budget", error: err });
        }
        console.log("Success");
        res.status(201).json({ message: "Budget saved successfully" });
    });
});

// app.get('/get-budgets', authenticateToken, async (req, res) => {
//     const { monthYear } = req.query;
//     const [year, month] = monthYear.split('-');
//     const userId = req.user.id;
//     try {
//         const query = `
//             SELECT 
//           categories.category_name, 
//           b.budget_limit, 
//           COALESCE(SUM(t.amount), 0) AS spend
//         FROM budget b
//         LEFT JOIN transactions t 
//         ON b.category_id = t.category_id
//         AND t.type_of_transaction = 'Expense'
//         AND MONTH(t.transaction_date) = ? 
//         AND YEAR(t.transaction_date) = ?
//         AND t.user_id = ?
//         WHERE b.user_id = ?
//         JOIN categories ON b.category_id = categories.id
//         WHERE b.user_id = ? 
//         AND transactions.type_of_transaction = 'Expense' 
//         GROUP BY b.category_id, b.budget_limit
//         `
//         con.query(query, [month, year, userId, userId, userId, ], (err, results) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).json({ message: "Error getting budget", error: err });
//             }
//             console.log("Success");
//             res.json(results);
//         });
//     //   const budgets = await db.query(`
//     //     SELECT 
//     //       b.category_name, 
//     //       b.limit, 
//     //       COALESCE(SUM(t.amount), 0) AS spend
//     //     FROM budget b
//     //     LEFT JOIN transactions t 
//     //     ON b.category_name = t.category_name
//     //     AND t.type_of_transaction = 'Expense'
//     //     AND MONTH(t.date) = ? 
//     //     AND YEAR(t.date) = ?
//     //     AND t.user_id = ?
//     //     WHERE b.user_id = ?
//     //     GROUP BY b.category_name, b.limit
//     //   `, [month, year, userId, userId]);
  
//     //   res.json(budgets);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });
app.get('/get-budgets', authenticateToken, async (req, res) => {
    const { monthYear } = req.query;
    const [year, month] = monthYear.split('-');
    const userId = req.user.id;

    try {
        const query = `
            SELECT 
                c.category_name, 
                b.budget_limit, 
                COALESCE(SUM(t.amount), 0) AS spend
            FROM budget b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN transactions t 
            ON b.category_id = t.category_id
            AND t.type_of_transaction = 'Expense'
            AND MONTH(t.transaction_date) = ? 
            AND YEAR(t.transaction_date) = ?
            AND t.user_id = ?
            WHERE b.user_id = ?
            AND b.monthYear = ?
            GROUP BY b.category_id, b.budget_limit, c.category_name
        `;

        con.query(query, [month, year, userId, userId, monthYear], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error getting budget", error: err });
            }
            console.log("Success");
            res.json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/get-accounts-summary', authenticateToken, (req, res) => {
    const userId = req.user.id;
    // const { monthYear, type_of_transaction } = req.query;

    // if (!monthYear || !type_of_transaction) {
    //     console.log("Month/Year and transaction type are required");
    //     return res.status(400).json({ message: "Month/Year and transaction type are required" });
    // }

    const query = `
        SELECT accounts.account_name, transactions.type_of_transaction, SUM(transactions.amount) as total_amount
        FROM transactions
        JOIN accounts ON transactions.account_id = accounts.id
        WHERE transactions.user_id = ? 
        GROUP BY accounts.account_name, transactions.type_of_transaction
    `;

    con.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving category summary", error: err });
        }
        console.log(results);
        res.json(results);
    });
});

app.post('/add-account', authenticateToken, (req,res) => {
    // const userId = req.user.id;
    const { account_name } = req.body;

    const query = `
        INSERT INTO accounts (account_name)
        SELECT ? 
        WHERE NOT EXISTS (
            SELECT 1 FROM accounts WHERE account_name = ?
        )
    `

    con.query(query, [account_name,account_name], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error adding the account to accounts table", error: err });
        }
        console.log("Success");
        res.status(201).json({ message: "Budget saved successfully" });
    })
});

// Example of a protected route
// app.get('/dashboard', (req, res) => {
//     const token = req.headers['authorization'];

//     if (!token) {
//         return res.status(403).json({ error: "No token provided" });
//     }

//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(500).json({ error: "Failed to authenticate token" });
//         }

//         // Token is valid, proceed to handle the request
//         res.json({ message: "Welcome to the dashboard", user: decoded });
//     });
// });

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
