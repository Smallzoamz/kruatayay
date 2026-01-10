/**
 * ========================================
 * 🌿 ครัวตายาย - Express Server
 * REST API for Thai Restaurant Landing Page
 * Powered by PostgreSQL (Supabase/Neon)
 * ========================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const { pool, query } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// SECURITY CONFIGURATION (Stealth Protection)
// ==========================================

// 1. Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP if it interferes with external CDNs for now, or configure properly
}));

// 2. Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// 3. Admin Authentication Middleware
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'krua-admin-2026';
const adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader === `Bearer ${ADMIN_SECRET}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Admin access required' });
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// MENU API
// ==========================================

// GET all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const categoriesResult = await query('SELECT * FROM menu_categories ORDER BY id');
        const itemsResult = await query('SELECT * FROM menu_items ORDER BY id');

        res.json({
            categories: categoriesResult.rows,
            items: itemsResult.rows.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category_id,
                price: item.price,
                description: item.description,
                image: item.image,
                isPopular: item.is_popular,
                isAvailable: item.is_available
            }))
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to load menu' });
    }
});

// POST new menu item
app.post('/api/menu', adminAuth, async (req, res) => {
    try {
        const { name, category, price, description, image, isPopular, isAvailable, id: reqId } = req.body;
        // Use provided ID or generate a timestamp one to match legacy behavior
        const id = reqId || Date.now();

        await query(
            `INSERT INTO menu_items (id, name, category_id, price, description, image, is_popular, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, name, category, price, description, image, isPopular || false, isAvailable !== false]
        );

        const newItem = { id, name, category, price, description, image, isPopular, isAvailable };
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});

// PUT update menu item
app.put('/api/menu/:id', adminAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, category, price, description, image, isPopular, isAvailable } = req.body;

        const result = await query(
            `UPDATE menu_items 
             SET name = COALESCE($1, name), 
                 category_id = COALESCE($2, category_id), 
                 price = COALESCE($3, price), 
                 description = COALESCE($4, description), 
                 image = COALESCE($5, image), 
                 is_popular = COALESCE($6, is_popular), 
                 is_available = COALESCE($7, is_available)
             WHERE id = $8
             RETURNING *`,
            [name, category, price, description, image, isPopular, isAvailable, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Map back to frontend expected keys
        const row = result.rows[0];
        res.json({
            id: row.id,
            name: row.name,
            category: row.category_id,
            price: row.price,
            description: row.description,
            image: row.image,
            isPopular: row.is_popular,
            isAvailable: row.is_available
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

// DELETE menu item
app.delete('/api/menu/:id', adminAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await query('DELETE FROM menu_items WHERE id = $1', [id]);
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

// ==========================================
// GALLERY API
// ==========================================

app.get('/api/gallery', async (req, res) => {
    try {
        const result = await query('SELECT * FROM gallery_images ORDER BY display_order ASC');
        res.json({ images: result.rows });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Failed to load gallery' });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        const { title, description, url, order } = req.body;
        const id = Date.now();

        await query(
            'INSERT INTO gallery_images (id, title, description, url, display_order) VALUES ($1, $2, $3, $4, $5)',
            [id, title, description, url, order || 0]
        );

        res.status(201).json({ id, title, description, url, order });
    } catch (error) {
        console.error('Error creating gallery image:', error);
        res.status(500).json({ error: 'Failed to create gallery image' });
    }
});

app.put('/api/gallery/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, description, url, order } = req.body;

        const result = await query(
            `UPDATE gallery_images
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 url = COALESCE($3, url),
                 display_order = COALESCE($4, display_order)
             WHERE id = $5 RETURNING *`,
            [title, description, url, order, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Image not found' });

        const row = result.rows[0];
        res.json({ id: row.id, title: row.title, description: row.description, url: row.url, order: row.display_order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update gallery image' });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await query('DELETE FROM gallery_images WHERE id = $1', [id]);
        res.json({ message: 'Gallery image deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete gallery image' });
    }
});

// ==========================================
// RESERVATIONS API
// ==========================================

app.get('/api/reservations', async (req, res) => {
    try {
        const result = await query('SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC');
        // Map DB columns to Frontend keys if needed (camelCase)
        const reservations = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            email: r.email,
            date: r.reservation_date, // Postgres keeps yyyy-mm-dd
            time: r.reservation_time,
            guests: r.guests,
            notes: r.notes,
            status: r.status,
            createdAt: r.created_at
        }));
        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load reservations' });
    }
});

app.post('/api/reservations', async (req, res) => {
    try {
        const { name, phone, email, date, time, guests, notes } = req.body;
        const id = Date.now();
        const status = 'pending';
        const createdAt = new Date().toISOString();

        await query(
            `INSERT INTO reservations (id, name, phone, email, reservation_date, reservation_time, guests, notes, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [id, name, phone, email, date, time, guests, notes, status, createdAt]
        );

        res.status(201).json({ id, name, phone, email, date, time, guests, notes, status, createdAt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

app.put('/api/reservations/:id', async (req, res) => {
    try {
        const id = req.params.id; // IDs can be big (timestamp), keep as string if possible or BigInt
        const { status } = req.body;

        const result = await query(
            'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Reservation not found' });

        const r = result.rows[0];
        res.json({
            id: r.id, name: r.name, phone: r.phone, email: r.email,
            date: r.reservation_date, time: r.reservation_time,
            guests: r.guests, notes: r.notes, status: r.status, createdAt: r.created_at
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update reservation' });
    }
});

app.delete('/api/reservations/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await query('DELETE FROM reservations WHERE id = $1', [id]);
        res.json({ message: 'Reservation deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
});

// ==========================================
// NEWS API
// ==========================================

app.get('/api/news', async (req, res) => {
    try {
        const result = await query('SELECT * FROM news_articles ORDER BY publish_date DESC');
        const articles = result.rows.map(a => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            content: a.content,
            image: a.image,
            date: a.publish_date,
            isPublished: a.is_published
        }));
        res.json({ articles });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load news' });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        const { title, excerpt, content, image, date, isPublished } = req.body;
        const id = Date.now();

        await query(
            `INSERT INTO news_articles (id, title, excerpt, content, image, publish_date, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, title, excerpt, content, image, date, isPublished !== false]
        );

        res.status(201).json({ id, title, excerpt, content, image, date, isPublished });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create news article' });
    }
});

app.put('/api/news/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, excerpt, content, image, date, isPublished } = req.body;

        const result = await query(
            `UPDATE news_articles
             SET title = COALESCE($1, title), excerpt = COALESCE($2, excerpt), 
                 content = COALESCE($3, content), image = COALESCE($4, image), 
                 publish_date = COALESCE($5, publish_date), is_published = COALESCE($6, is_published)
             WHERE id = $7 RETURNING *`,
            [title, excerpt, content, image, date, isPublished, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Article not found' });

        const row = result.rows[0];
        res.json({
            id: row.id, title: row.title, excerpt: row.excerpt,
            content: row.content, image: row.image,
            date: row.publish_date, isPublished: row.is_published
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update news' });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        await query('DELETE FROM news_articles WHERE id = $1', [parseInt(req.params.id)]);
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

// ==========================================
// REVIEWS API
// ==========================================

app.get('/api/reviews', async (req, res) => {
    try {
        // Public endpoint: only approved
        const result = await query('SELECT * FROM reviews WHERE approved = true ORDER BY created_at DESC');
        res.json(result.rows.map(r => ({ ...r, date: r.created_at })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

app.get('/api/reviews/all', async (req, res) => {
    try {
        // Admin endpoint: all
        const result = await query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json(result.rows.map(r => ({ ...r, date: r.created_at })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        let { name, rating, comment } = req.body;

        // Stealth Validation: Sanitize Inputs
        name = xss(name || 'ลูกค้า');
        comment = xss(comment || '');

        const id = Date.now();
        const approved = false;
        const createdAt = new Date().toISOString();

        await query(
            `INSERT INTO reviews (id, name, rating, comment, approved, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, name, rating, comment, approved, createdAt]
        );

        res.status(201).json({ message: 'Review submitted', review: { id, name, rating, comment, approved, date: createdAt } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

app.put('/api/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { approved, rating, comment, name } = req.body;

        const result = await query(
            `UPDATE reviews 
             SET approved = COALESCE($1, approved), rating = COALESCE($2, rating),
                 comment = COALESCE($3, comment), name = COALESCE($4, name)
             WHERE id = $5 RETURNING *`,
            [approved, rating, comment, name, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Review not found' });
        const r = result.rows[0];
        res.json({ ...r, date: r.created_at });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update review' });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// ==========================================
// SETTINGS API
// ==========================================

app.get('/api/settings', async (req, res) => {
    try {
        const result = await query('SELECT key, value FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });

        // Remove adminCode from public response
        const { adminCode, ...publicData } = settings;
        res.json(publicData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        // Iterate over keys in body and update/insert them
        const updates = req.body;
        const keys = Object.keys(updates);

        if (keys.length === 0) return res.json({});

        // We need to fetch existing because we might be doing partial updates (deep merge support for things like restaurant.openingHours)
        // But for simplicity, we blindly update the top-level keys.
        // If 'restaurant' is passed, we replace the 'restaurant' value.
        // If we really need deep merge, checking existing is needed.
        // Let's support basic top-level merge as per original code logic (approx).

        // Actually, the original code did a deep merge. Let's replicate that behavior by fetch -> merge -> upsert.
        const currentRes = await query('SELECT key, value FROM settings');
        const currentSettings = {};
        currentRes.rows.forEach(r => currentSettings[r.key] = r.value);

        const finalSettings = { ...currentSettings };

        // Logic from original:
        if (updates.restaurant) {
            finalSettings.restaurant = {
                ...(currentSettings.restaurant || {}),
                ...updates.restaurant
            };
            if (updates.restaurant.openingHours) {
                finalSettings.restaurant.openingHours = {
                    ...(currentSettings.restaurant?.openingHours || {}),
                    ...updates.restaurant.openingHours
                };
            }
        }
        if (updates.about) {
            finalSettings.about = { ...(currentSettings.about || {}), ...updates.about };
        }
        if (updates.founder) {
            finalSettings.founder = { ...(currentSettings.founder || {}), ...updates.founder };
        }
        // For other keys
        ['timeline', 'adminCode'].forEach(k => {
            if (updates[k]) finalSettings[k] = updates[k];
        });

        // Ensure adminCode persists
        if (!finalSettings.adminCode) finalSettings.adminCode = 'krua2026';

        // Write content back to DB (Upsert)
        for (const [key, value] of Object.entries(finalSettings)) {
            await query(
                `INSERT INTO settings (key, value) VALUES ($1, $2)
                 ON CONFLICT (key) DO UPDATE SET value = $2`,
                [key, value]
            );
        }

        const { adminCode, ...publicData } = finalSettings;
        res.json(publicData);
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ==========================================
// MENU SYNC API (Receive from POS)
// ==========================================

const SYNC_SECRET = process.env.SYNC_SECRET || 'pos-website-sync-2026';

app.post('/api/sync-menu', async (req, res) => {
    const client = await pool.connect();
    try {
        const incomingSecret = req.headers['x-sync-secret'];
        if (incomingSecret !== SYNC_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { categories, items } = req.body;
        if (!categories || !items) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        await client.query('BEGIN');

        // 1. Preserve existing descriptions (Website Description is Master)
        const existingRes = await client.query('SELECT id, description FROM menu_items');
        const descriptionMap = new Map();
        existingRes.rows.forEach(row => {
            if (row.description) descriptionMap.set(String(row.id), row.description);
        });

        // 2. Clear existing menu (Full Sync Strategy)
        await client.query('DELETE FROM menu_items');
        await client.query('DELETE FROM menu_categories');

        // 3. Insert Categories
        for (const cat of categories) {
            // Ensure ID is string or int as per DB schema (schema uses casting likely, but let's be safe)
            // SiteRestaurant Schema: id (TEXT or INT?) -> Let's check init_db.js or schema.sql to be sure. 
            // Previous code used $1 directly. Assuming IDs are compatible.
            // If POS sends "101" (string) and DB is INT, PG usually handles it, but let's assume it works as before.
            await client.query(
                'INSERT INTO menu_categories (id, name, icon) VALUES ($1, $2, $3)',
                [cat.id, cat.name, cat.icon]
            );
        }

        // 4. Insert Items (Merge Descriptions)
        for (const item of items) {
            const itemIdStr = String(item.id);
            // Use existing website description if available, otherwise use POS description
            const finalDescription = descriptionMap.has(itemIdStr)
                ? descriptionMap.get(itemIdStr)
                : (item.description || '');

            await client.query(
                `INSERT INTO menu_items (id, name, category_id, price, description, image, is_popular, is_available)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    item.id,
                    item.name,
                    item.category_id || item.category,
                    item.price,
                    finalDescription, // <--- Preserved Description
                    item.image,
                    item.is_popular || false,
                    item.is_available !== false
                ]
            );
        }

        await client.query('COMMIT');

        console.log(`[Sync] ✅ Menu synced: ${items.length} items to DB (Descriptions Preserved)`);
        res.json({ success: true, message: 'Menu synced successfully', itemsCount: items.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Sync] Error:', error);
        res.status(500).json({ error: 'Failed to sync menu: ' + error.message });
    } finally {
        client.release();
    }
});

app.get('/api/sync-status', async (req, res) => {
    try {
        const result = await query('SELECT COUNT(*) as count FROM menu_items');
        res.json({
            status: 'ready',
            itemsCount: parseInt(result.rows[0].count),
            lastModified: new Date().toISOString() // In a real DB, we'd query max(updated_at)
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(PORT, () => {
    console.log(`🌿 Krua Ta Yai Server running on port ${PORT} (PostgreSQL Mode)`);
});

