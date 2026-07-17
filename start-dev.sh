#!/bin/bash

echo "=========================================="
echo "🎬 Khởi chạy toàn bộ hệ thống CinemaX 🎬"
echo "=========================================="

echo "🔍 Đang tự động quét IP LAN của máy chủ Windows..."
LAN_IP=$(ipconfig.exe 2>/dev/null | grep -a "IPv4" | grep -oE '192\.168\.[0-9]+\.[0-9]+|10\.[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)

if [ -z "$LAN_IP" ]; then
    echo "⚠️ Không tìm thấy IP mạng Windows. Dùng thử IP của WSL..."
    LAN_IP=$(hostname -I | awk '{print $1}')
fi

echo "✅ IP mạng nội bộ của bạn là: $LAN_IP"
echo "📱 Đảm bảo điện thoại của bạn dùng chung mạng Wi-Fi với máy tính này."

export LAN_IP=$LAN_IP

echo "📝 Đang tạo/cập nhật file .env cho ứng dụng Mobile (Expo)..."
cat > ./mobile-app-expo/.env <<EOL
# File này được tự động tạo bởi start-dev.sh
EXPO_PUBLIC_API_URL=http://$LAN_IP:8080/api
EOL

echo "🐳 Đang build và khởi chạy Docker (Web, DB, Mobile)..."
docker compose up --build -d

echo "=========================================="
echo "🎉 Xong! Hệ thống đang khởi động ngầm."
echo "🌍 Backend / Web App: http://localhost:8080"
echo "📱 Xem log và lấy mã QR quét điện thoại:"
echo "   docker compose logs -f mobile"
echo "=========================================="
