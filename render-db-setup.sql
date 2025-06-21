-- Script pentru adăugarea recenziilor în baza de date Neon
-- Rulează acest script în consola SQL Neon

-- Verifică dacă există deja recenzii
SELECT COUNT(*) as existing_reviews FROM reviews WHERE is_approved = true;

-- Șterge recenziile existente dacă vrei să le resetezi (opțional)
-- DELETE FROM reviews;

-- Adaugă recenziile pentru CoralMed
INSERT INTO reviews (name, rating, comment, is_approved, created_at) VALUES 
('Maria Popescu', 5, 'Servicii excelente! Dr. sunt foarte profesionali și clinica este foarte modernă. Recomand cu încredere!', true, NOW()),
('Alexandru Ionescu', 5, 'Am fost foarte mulțumit de tratamentul primit. Personalul este foarte amabil și explicațiile sunt clare.', true, NOW()),
('Elena Radu', 4, 'Experiență foarte bună! Tratamentul a fost fără durere și rezultatul final este fantastic.', true, NOW()),
('Mihai Georgescu', 5, 'CoralMed este cea mai bună clinică dentară din București! Tehnologie modernă și doctori excelenți.', true, NOW()),
('Ana Stoica', 5, 'Mulțumesc pentru profesionalismul dovedit! Mă simt mult mai încrezătoare cu noul meu zâmbet.', true, NOW()),
('Cristian Dumitrescu', 4, 'Foarte mulțumit de serviciile primite. Programarea a fost ușoară și totul s-a desfășurat perfect.', true, NOW());

-- Verifică că recenziile au fost adăugate cu succes
SELECT name, rating, comment, is_approved FROM reviews WHERE is_approved = true ORDER BY created_at DESC;