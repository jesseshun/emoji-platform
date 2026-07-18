#!/usr/bin/env bash
# Emoji Platform — 服务器一键备份（.env 密钥 + PostgreSQL 数据库）
# 在部署目录 ~/emoji-platform 下运行： bash BACKUP_NOW.sh
set -euo pipefail
cd ~/emoji-platform

# 从 .env 读取数据库变量
PGUSER=$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2-)
PGDB=$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2-)
PGPASS=$(grep -E '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)

DATE=$(date +%Y%m%d-%H%M)
BACKUP_DIR=~/emoji-platform-backup
mkdir -p "$BACKUP_DIR"

echo "== 1) 备份 .env（含数据库 / JWT 密钥，务必妥善保管）=="
cp .env "$BACKUP_DIR/.env"

echo "== 2) 导出 PostgreSQL 数据库 =="
PGPASSWORD="$PGPASS" sudo docker compose -f docker-compose.preview.yml exec -T postgres \
  pg_dump -U "$PGUSER" --no-owner --clean --if-exists "$PGDB" > "$BACKUP_DIR/db.dump"
echo "   db.dump 大小: $(stat -c %s "$BACKUP_DIR/db.dump") 字节"

echo "== 3) 打包 =="
tar -czf "emoji-platform-backup-$DATE.tar.gz" -C "$BACKUP_DIR" .env db.dump
echo "   备份包: $(pwd)/emoji-platform-backup-$DATE.tar.gz"
echo "   大小:   $(stat -c %s "emoji-platform-backup-$DATE.tar.gz") 字节"

echo
echo "== 完成 =="
echo "请把生成的 emoji-platform-backup-$DATE.tar.gz 下载到本地并上传到网盘备份。"
echo "该包包含 .env 密钥与数据库，切勿提交到 GitHub 或泄露。"
