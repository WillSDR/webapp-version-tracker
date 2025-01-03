const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('apps.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTable();
    }
});

function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            version TEXT NOT NULL,
            releaseDate TEXT NOT NULL,
            status TEXT NOT NULL,
            installUrl TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Apps table ready');
            initializeDummyData();
        }
    });
}

async function initializeDummyData() {
    const dummyApps = [
        {
            name: "Shopping App",
            platform: "ios",
            version: "2.1.0",
            releaseDate: "2024-03-15",
            status: "Production",
            installUrl: "https://testflight.apple.com/join/dummy1"
        },
        {
            name: "Shopping App",
            platform: "android",
            version: "2.0.9",
            releaseDate: "2024-03-14",
            status: "Production",
            installUrl: "https://play.google.com/store/apps/details?id=dummy1"
        },
        {
            name: "Delivery App",
            platform: "ios",
            version: "1.5.0-beta",
            releaseDate: "2024-03-18",
            status: "Testing",
            installUrl: "https://testflight.apple.com/join/dummy2"
        },
        {
            name: "Delivery App",
            platform: "android",
            version: "1.4.9-beta",
            releaseDate: "2024-03-17",
            status: "Testing",
            installUrl: "https://play.google.com/apps/testing/dummy2"
        },
        {
            name: "Admin Portal",
            platform: "ios",
            version: "3.0.0-dev",
            releaseDate: "2024-03-20",
            status: "Development",
            installUrl: "https://testflight.apple.com/join/dummy3"
        }
    ];

    // Modify the table to include installUrl
    db.run(`
        ALTER TABLE apps 
        ADD COLUMN installUrl TEXT
    `, (err) => {
        if (!err || err.message.includes('duplicate column name')) {
            // Insert dummy data
            const insert = 'INSERT INTO apps (name, platform, version, releaseDate, status, installUrl) VALUES (?, ?, ?, ?, ?, ?)';
            
            db.get('SELECT COUNT(*) as count FROM apps', (err, row) => {
                if (err) {
                    console.error('Error checking apps count:', err);
                    return;
                }
                
                // Only insert if table is empty
                if (row.count === 0) {
                    dummyApps.forEach(app => {
                        db.run(insert, [
                            app.name,
                            app.platform,
                            app.version,
                            app.releaseDate,
                            app.status,
                            app.installUrl
                        ]);
                    });
                    console.log('Dummy data initialized');
                }
            });
        }
    });
}

// Call initializeDummyData after database connection
db.on('open', () => {
    createTable();
    initializeDummyData();
});

// API Routes
app.get('/api/apps', (req, res) => {
    const platform = req.query.platform;
    let sql = 'SELECT * FROM apps';
    let params = [];

    if (platform && platform !== 'all') {
        sql += ' WHERE platform = ?';
        params = [platform];
    }

    sql += ' ORDER BY updated_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/apps', (req, res) => {
    const { name, platform, version, releaseDate, status } = req.body;
    
    const sql = `
        INSERT INTO apps (name, platform, version, releaseDate, status)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [name, platform, version, releaseDate, status], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/apps/:id', (req, res) => {
    const { name, platform, version, releaseDate, status } = req.body;
    
    const sql = `
        UPDATE apps 
        SET name = ?, platform = ?, version = ?, releaseDate = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [name, platform, version, releaseDate, status, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

app.delete('/api/apps/:id', (req, res) => {
    const sql = 'DELETE FROM apps WHERE id = ?';
    
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${3000}`);
}); 