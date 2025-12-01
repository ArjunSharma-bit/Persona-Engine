CREATE TABLE IF NOT EXISTS daily_events (
    date DATE PRIMARY KEY, 
    total_events INT NOT NULL    
);

CREATE TABLE IF NOT EXISTS category_stats (
    date DATE,
    category INT NOT NULL, 
    views INT NOT NULL,
    purchases INT NOT NULL,
    PRIMARY KEY (date, category)
);

CREATE TABLE IF NOT EXISTS revenue_daily (
    date DATE PRIMARY KEY,
    revenue INT NOT NULL,
    orders INT NOT NULL
);


CREATE TABLE IF NOT EXISTS new_users_daily (
    date DATE PRIMARY KEY,
    new_users INT NOT NULL
);