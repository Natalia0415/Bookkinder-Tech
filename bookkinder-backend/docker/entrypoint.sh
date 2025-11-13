#!/bin/sh
set -e

echo "Iniciando entrypoint para API Laravel..."

# -------------------------------
# 1️⃣ Instalar dependencias PHP con Composer
# -------------------------------
if [ -f /var/www/html/composer.json ]; then
    echo "Instalando dependencias de Composer..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
else
    echo "No se encontró composer.json, se omite Composer install."
fi

# -------------------------------
# 2️⃣ Preparar directorios de logs y permisos
# -------------------------------
echo "Preparando directorios de logs..."
mkdir -p /var/www/html/storage/logs
mkdir -p /var/log/nginx
mkdir -p /var/log/supervisor

chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# -------------------------------
# 3️⃣ Cachear configuración y rutas
# -------------------------------
echo "Cacheando configuración y rutas..."
php artisan config:cache || true
php artisan route:cache || true

# -------------------------------
# 4️⃣ Ejecutar migraciones automáticamente (seguro para prod/dev)
# -------------------------------
echo "Ejecutando migraciones..."
php artisan migrate:fresh --seed --force || true

# -------------------------------
# 5️⃣ Iniciar servicios
# -------------------------------
echo "Iniciando servidor HTTP de Laravel en 0.0.0.0:8000..."
php artisan serve --host=0.0.0.0 --port=8000
