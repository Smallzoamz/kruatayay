const { pool } = require('../db');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

async function readJson(filename) {
    try {
        const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.warn(`Could not read ${filename}, skipping...`);
        return null; // File might not exist
    }
}

async function migrate() {
    console.log('🚀 Starting Data Migration (JSON -> PostgreSQL)...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Menu
        const menuData = await readJson('menu.json');
        if (menuData) {
            console.log(`Migrating ${menuData.categories?.length || 0} categories, ${menuData.items?.length || 0} items...`);

            for (const cat of (menuData.categories || [])) {
                await client.query(
                    'INSERT INTO menu_categories (id, name, icon) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
                    [cat.id, cat.name, cat.icon]
                );
            }

            for (const item of (menuData.items || [])) {
                await client.query(
                    `INSERT INTO menu_items (id, name, category_id, price, description, image, is_popular, is_available)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
                    [item.id, item.name, item.category, item.price, item.description, item.image, item.isPopular, item.isAvailable]
                );
            }
        }

        // 2. Gallery
        const galleryData = await readJson('gallery.json');
        if (galleryData && galleryData.images) {
            console.log(`Migrating ${galleryData.images.length} gallery images...`);
            for (const img of galleryData.images) {
                await client.query(
                    'INSERT INTO gallery_images (id, title, description, url, display_order) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                    [img.id, img.title, img.description, img.url, img.order]
                );
            }
        }

        // 3. Reservations
        const resData = await readJson('reservations.json');
        if (resData && resData.reservations) {
            console.log(`Migrating ${resData.reservations.length} reservations...`);
            for (const r of resData.reservations) {
                await client.query(
                    `INSERT INTO reservations (id, name, phone, email, reservation_date, reservation_time, guests, notes, status, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
                    [r.id, r.name, r.phone, r.email, r.date, r.time, r.guests, r.notes, r.status, r.createdAt]
                );
            }
        }

        // 4. News
        const newsData = await readJson('news.json');
        if (newsData && newsData.articles) {
            console.log(`Migrating ${newsData.articles.length} news articles...`);
            for (const a of newsData.articles) {
                await client.query(
                    `INSERT INTO news_articles (id, title, excerpt, content, image, publish_date, is_published)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
                    [a.id, a.title, a.excerpt, a.content, a.image, a.date, a.isPublished]
                );
            }
        }

        // 5. Reviews
        const reviewsData = await readJson('reviews.json');
        if (reviewsData && Array.isArray(reviewsData)) {
            console.log(`Migrating ${reviewsData.length} reviews...`);
            for (const r of reviewsData) {
                await client.query(
                    `INSERT INTO reviews (id, name, rating, comment, approved, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
                    [r.id, r.name, r.rating, r.comment, r.approved, r.date]
                );
            }
        }

        // 6. Settings
        const settingsData = await readJson('settings.json');
        if (settingsData) {
            console.log(`Migrating Settings...`);
            for (const [key, value] of Object.entries(settingsData)) {
                await client.query(
                    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                    [key, value]
                );
            }
        }

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
