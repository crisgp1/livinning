#!/bin/bash

# ============================================
# Script para probar el webhook de Stripe localmente
# ============================================

echo "🚀 Iniciando prueba del webhook de Stripe..."
echo ""

# Verificar si stripe CLI está instalado
if ! command -v stripe &> /dev/null
then
    echo "❌ Stripe CLI no está instalado."
    echo ""
    echo "Para instalar:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Otras plataformas: https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✅ Stripe CLI instalado"
echo ""

# Verificar si el usuario está autenticado
if ! stripe config --list &> /dev/null
then
    echo "❌ No estás autenticado con Stripe."
    echo ""
    echo "Ejecuta: stripe login"
    exit 1
fi

echo "✅ Autenticado con Stripe"
echo ""

echo "📝 Simulando evento checkout.session.completed..."
echo ""

# Simular evento con metadata personalizado
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.userId=user_test123 \
  --override checkout_session:metadata.packageType=package_5 \
  --override checkout_session:metadata.userName="Test User"

echo ""
echo "✅ Evento enviado!"
echo ""
echo "Revisa los logs de tu servidor Next.js para ver si el webhook se procesó correctamente."
echo "Deberías ver mensajes como:"
echo "  ✅ Webhook signature verified: checkout.session.completed"
echo "  💳 Processing checkout.session.completed"
echo "  Processing upgrade: User user_test123 -> Package package_5"
echo "  ✅ Upgrade processed successfully"
