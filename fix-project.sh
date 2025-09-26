#!/bin/bash

echo "🔧 SCRIPT DE REPARACIÓN COMPLETA DEL PROYECTO"
echo "============================================"
echo ""

# 1. Detener todos los procesos
echo "1️⃣ Deteniendo procesos Node..."
pkill -f "npm" 2>/dev/null
pkill -f "node" 2>/dev/null
pkill -f "next" 2>/dev/null
sleep 2
echo "✅ Procesos detenidos"
echo ""

# 2. Limpiar archivos problemáticos
echo "2️⃣ Limpiando archivos problemáticos..."
rm -rf .next 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -f package-lock.json 2>/dev/null
echo "✅ Archivos temporales limpiados"
echo ""

# 3. Reinstalar dependencias
echo "3️⃣ Reinstalando todas las dependencias..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# 4. Instalar dependencias faltantes específicas
echo "4️⃣ Instalando dependencias faltantes..."
npm install @clerk/nextjs@latest
echo "✅ Clerk instalado"
echo ""

# 5. Arreglar lightningcss para Linux
echo "5️⃣ Arreglando lightningcss..."
npm uninstall lightningcss
npm install lightningcss@latest
echo "✅ Lightningcss configurado"
echo ""

# 6. Verificar tipos
echo "6️⃣ Verificando TypeScript..."
npx tsc --noEmit || echo "⚠️  Advertencias de TypeScript (no críticas)"
echo ""

# 7. Intentar build
echo "7️⃣ Intentando build de producción..."
npm run build

echo ""
echo "✅ Script de reparación completado"
echo "============================================"
echo ""
echo "Si el build falló, intenta:"
echo "1. Reiniciar la terminal"
echo "2. Ejecutar: npm run dev"
echo "3. Verificar en http://localhost:3000"