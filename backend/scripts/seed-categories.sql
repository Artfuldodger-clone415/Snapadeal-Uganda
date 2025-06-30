-- Create default categories for Snapadeal
INSERT INTO categories (name, description, icon_url, is_active, created_at, updated_at) VALUES
('Restaurants & Food', 'Dining, takeout, and food delivery deals', '🍽️', true, datetime('now'), datetime('now')),
('Beauty & Spa', 'Beauty treatments, spa services, and wellness', '💅', true, datetime('now'), datetime('now')),
('Fitness & Health', 'Gym memberships, fitness classes, and health services', '💪', true, datetime('now'), datetime('now')),
('Entertainment', 'Movies, events, concerts, and fun activities', '🎬', true, datetime('now'), datetime('now')),
('Travel & Tourism', 'Hotels, tours, and travel experiences', '✈️', true, datetime('now'), datetime('now')),
('Shopping & Retail', 'Clothing, electronics, and retail deals', '🛍️', true, datetime('now'), datetime('now')),
('Services', 'Professional services, repairs, and consultations', '🔧', true, datetime('now'), datetime('now')),
('Education & Training', 'Courses, workshops, and educational programs', '📚', true, datetime('now'), datetime('now'));
