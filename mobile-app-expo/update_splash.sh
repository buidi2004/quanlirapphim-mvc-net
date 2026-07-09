#!/bin/bash
sed -i '' -e 's/<Text.*CinemaX<\/Text>/<Image source={require("..\/..\/..\/assets\/images\/logo-glow.png")} style={{ width: 180, height: 180 }} contentFit="contain" \/>/g' /Users/admin/quanlirapphim-mvc-net/mobile-app-expo/src/screens/Home/HomeScreen.tsx
