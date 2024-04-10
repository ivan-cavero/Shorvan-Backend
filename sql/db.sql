CREATE TABLE links (
    id INTEGER PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    user_id INTEGER,
    expiration_date DATETIME,
    click_count INTEGER DEFAULT 0,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


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
    FOREIGN KEY (link_id) REFERENCES links(id)
);
        

CREATE TABLE qr_codes (
    id INTEGER PRIMARY KEY,
    link_id INTEGER,
    code BLOB NOT NULL,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE TABLE brand_links (
    id INTEGER PRIMARY KEY,
    link_id INTEGER,
    brand_name TEXT NOT NULL,
    custom_short_code TEXT,
    original_created_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES links(id)
);
    

CREATE TRIGGER delete_link_cascade
AFTER DELETE ON links
BEGIN
    DELETE FROM clicks WHERE link_id = OLD.id;
    DELETE FROM brand_links WHERE link_id = OLD.id;
    DELETE FROM qr_codes WHERE link_id = OLD.id;
END;