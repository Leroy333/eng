import fs from 'fs';

// Читаем файл
const filePath = 'src/database/repositories.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Заменяем все PostgreSQL параметры на SQLite
content = content.replace(/\$(\d+)/g, '?');

// Заменяем ILIKE на LIKE (SQLite не поддерживает ILIKE)
content = content.replace(/ILIKE/g, 'LIKE');

// Записываем обратно
fs.writeFileSync(filePath, content);

console.log('✅ Заменены PostgreSQL параметры на SQLite');
