-- Main database schema for the URL shortener application

-- Main table to store the shortened links
CREATE TABLE links (
    id INTEGER PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    user_id INTEGER,
    expiration_date DATETIME,
    click_count INTEGER DEFAULT 0,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN,
    deleted_at DATETIME
);

-- Index for short_code
CREATE UNIQUE INDEX idx_links_short_code ON links(short_code);

-- Index for user_id
CREATE INDEX idx_links_user_id ON links(user_id);


-- Clicks table to store click data
CREATE TABLE clicks (
    id INTEGER PRIMARY KEY,
    link_id INTEGER NOT NULL,
    original_clicked_at DATETIME,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_type TEXT,
    operating_system TEXT,
    browser_name TEXT,
    browser_language TEXT,
    country TEXT,
    city TEXT,
    referrer TEXT,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN,
    deleted_at DATETIME,
    FOREIGN KEY (link_id) REFERENCES links(id)
);

-- Indexes for clicks table
CREATE INDEX idx_clicks_link_id ON clicks(link_id);

-- Index for clicked_at
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);

-- Index for device_type
CREATE INDEX idx_clicks_device_type ON clicks(device_type);


-- QR codes table to store QR code data
CREATE TABLE qr_codes (
    id INTEGER PRIMARY KEY,
    link_id INTEGER,
    code BLOB NOT NULL,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN,
    deleted_at DATETIME,
    FOREIGN KEY (link_id) REFERENCES links(id)
);

-- Indexes for qr_codes table
CREATE INDEX idx_qr_codes_link_id ON qr_codes(link_id);


-- Brand links table to store custom short codes for brands
CREATE TABLE brand_links (
    id INTEGER PRIMARY KEY,
    link_id INTEGER,
    brand_name TEXT NOT NULL,
    custom_short_code TEXT,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN,
    deleted_at DATETIME,
    FOREIGN KEY (link_id) REFERENCES links(id)
);

-- Indexes for brand_links table
CREATE INDEX idx_brand_links_link_id ON brand_links(link_id);

-- Index for brand_name
CREATE INDEX idx_brand_links_brand_name ON brand_links(brand_name);
