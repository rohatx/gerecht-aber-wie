FROM php:8.2-apache

# Apache-Konfiguration erweitern (nur wenn nötig)
# RUN a2enmod rewrite

# Arbeitsverzeichnis
WORKDIR /var/www/html

# Dateien in den Container kopieren
COPY src/ /var/www/html/

# Schreibrechte auf CSV-Datei sicherstellen
RUN touch /var/www/html/stats.csv && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod 666 /var/www/html/stats.csv
