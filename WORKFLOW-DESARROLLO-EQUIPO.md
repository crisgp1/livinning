# 🚀 Workflow de Desarrollo en Equipo - Livinning

## 📋 Guía completa para desarrollo colaborativo sin conflictos

---

## 🌟 **REGLAS DE ORO**

1. **Una feature = una rama**
2. **NUNCA commitear directo a `main`**
3. **Rebase diario con `main`**
4. **Comunicación constante entre desarrolladores**
5. **Commits pequeños y descriptivos**
6. **Pull Request obligatorio para todo cambio**

---

## 🔄 **ESTRATEGIA DE BRANCHING**

### **Estructura de ramas:**
```
main (producción)
├── develop (desarrollo)
├── feature/auth-system      # Dev 1
├── feature/property-crud    # Dev 2
├── feature/dashboard-ui     # Dev 1
├── hotfix/price-bug         # Cualquiera
└── release/v1.2.0          # Release
```

### **Convención de nombres:**
```bash
feature/descripcion-corta    # Nueva funcionalidad
bugfix/nombre-del-bug       # Corrección de bug
hotfix/bug-critico          # Fix urgente
refactor/componente         # Refactorización
docs/actualizacion          # Documentación
```

---

## 📅 **WORKFLOW DIARIO**

### **🌅 Al empezar el día (OBLIGATORIO):**

```bash
# 1. Ir a main y actualizar
git checkout main
git pull origin main

# 2. Ir a tu rama y aplicar cambios
git checkout feature/mi-funcionalidad
git rebase main

# 3. Si hay conflictos, resolverlos ahora
# 4. Push para sincronizar
git push origin feature/mi-funcionalidad --force-with-lease
```

### **🔄 Durante el día:**

```bash
# Commits frecuentes (cada 1-2 horas)
git add .
git commit -m "feat: implement user validation"
git push origin feature/mi-funcionalidad

# Avisar al equipo en Slack/Discord
"🚧 Trabajando en components/Login.tsx"
```

### **🌙 Al terminar el día:**

```bash
# 1. Commit final del día
git add .
git commit -m "feat: complete login functionality"

# 2. Rebase final con main
git checkout main
git pull origin main
git checkout feature/mi-funcionalidad
git rebase main

# 3. Push final
git push origin feature/mi-funcionalidad --force-with-lease

# 4. Si está listo, crear Pull Request
```

---

## 🚀 **PROCESO DE PULL REQUEST**

### **1. Antes de crear PR:**

```bash
# Checklist obligatorio:
☐ Rebase con main exitoso
☐ Tests pasan: npm run test
☐ Build exitoso: npm run build
☐ Lint limpio: npm run lint
☐ No hay console.log olvidados
☐ Código documentado si es necesario
```

### **2. Crear Pull Request:**

```bash
# En GitHub, título descriptivo:
feat: Add user authentication system

# Descripción del PR:
## 📝 Cambios realizados
- ✅ Login component con validación
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Error handling

## 🧪 Testing
- ✅ Login exitoso
- ✅ Login fallido
- ✅ Token persistence
- ✅ Logout functionality

## 📸 Screenshots
[Incluir screenshots si hay UI]
```

### **3. Code Review Process:**

```bash
# El otro desarrollador revisa:
☐ Funcionalidad correcta
☐ Código limpio y legible
☐ Sin bugs evidentes
☐ Sigue estándares del proyecto
☐ No rompe funcionalidad existente

# Aprobar con: ✅ LGTM (Looks Good To Me)
# O solicitar cambios con comentarios específicos
```

---

## 💡 **DIVISIÓN DE TRABAJO INTELIGENTE**

### **División por módulos/features:**

```
👨‍💻 Desarrollador 1:              👩‍💻 Desarrollador 2:
├── 🔐 Authentication            ├── 🏠 Property Management
│   ├── components/Login.tsx     │   ├── components/PropertyCard.tsx
│   ├── pages/auth/             │   ├── pages/properties/
│   ├── utils/auth.ts           │   ├── utils/property.ts
│   └── hooks/useAuth.ts        │   └── hooks/useProperties.ts
│                               │
├── 📊 Dashboard                ├── 💳 Payments
│   ├── components/Dashboard/   │   ├── components/Checkout.tsx
│   ├── pages/dashboard/        │   ├── utils/stripe.ts
│   └── utils/stats.ts          │   └── hooks/usePayments.ts
```

### **División por capas:**

```
👨‍💻 Dev 1 - Frontend:           👩‍💻 Dev 2 - Backend:
├── components/                 ├── app/api/
├── pages/                      ├── lib/application/
├── styles/                     ├── lib/domain/
└── hooks/                      └── lib/infrastructure/
```

---

## 🛠️ **CONVENTIONAL COMMITS**

### **Formato obligatorio:**
```bash
<tipo>(<scope>): <descripción>

# Ejemplos:
feat: add user login component
fix: resolve price formatting bug
docs: update README with setup instructions
style: format code with prettier
refactor: reorganize auth components
test: add unit tests for login
chore: update dependencies
```

### **Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo (no afecta funcionalidad)
- `refactor`: Refactorización sin cambio funcional
- `test`: Pruebas
- `chore`: Tareas de mantenimiento

---

## ⚠️ **PREVENCIÓN DE CONFLICTOS**

### **1. Comunicación en tiempo real:**

```bash
# Slack/Discord/WhatsApp del equipo:
"🚧 Voy a trabajar en components/Header.tsx"
"✅ Terminé utils/api.ts, ya pueden usarlo"
"⚠️  Voy a hacer cambios grandes en el routing"
"🔄 Hice rebase, pueden actualizar sus ramas"
```

### **2. Archivos que NO se tocan al mismo tiempo:**
- `package.json` (uno a la vez)
- Archivos de configuración global
- Archivos de estilos globales
- `README.md`

### **3. Si DEBES tocar el mismo archivo:**
```bash
# Coordinar en el chat:
"Necesito modificar components/Navigation.tsx líneas 50-60"
"Ok, yo termino mi parte (líneas 1-30) y te aviso"
"✅ Listo, ya puedes trabajar en Navigation.tsx"
```

---

## 🚨 **RESOLUCIÓN DE CONFLICTOS**

### **Cuando hay conflicto en rebase:**

```bash
# Git te mostrará los archivos en conflicto
git status

# Editar cada archivo con conflicto:
const apiUrl = 'http://localhost:3000'
const apiUrl = 'https://api.livinning.com' (código de main)

# Decidir qué código mantener o combinar ambos
const apiUrl = process.env.NODE_ENV === 'production'
  ? 'https://api.livinning.com'
  : 'http://localhost:3000'

# Continuar rebase
git add .
git rebase --continue
```

### **Conflictos comunes y soluciones:**

| Conflicto | Solución |
|-----------|----------|
| `package.json` | Combinar dependencias, mantener versión mayor |
| Imports | Mantener ambos si son necesarios |
| Estilos CSS | Combinar o dar prioridad al más reciente |
| Configuración | Verificar con el equipo cuál usar |

---

## 📊 **HERRAMIENTAS RECOMENDADAS**

### **1. VSCode Extensions:**
```json
{
  "recommendations": [
    "eamodio.gitlens",              // Ver historial de Git
    "mhutchie.git-graph",           // Visualizar branches
    "donjayamanne.githistory",      // Historial de archivos
    "ms-vscode.vscode-json",        // JSON formatting
    "bradlc.vscode-tailwindcss"     // Tailwind IntelliSense
  ]
}
```

### **2. Git Aliases útiles:**
```bash
# Agregar al ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    ps = push
    pl = pull
    rb = rebase
    lg = log --oneline --graph --all
```

### **3. Scripts en package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "pre-commit": "lint-staged"
  }
}
```

---

## 🎯 **CHECKLIST ANTES DE PR**

```bash
☐ npm run lint              # Sin errores de lint
☐ npm run type-check        # Sin errores TypeScript
☐ npm run build            # Build exitoso
☐ npm run test             # Tests pasando
☐ git rebase main          # Actualizado con main
☐ No console.log olvidados  # Código limpio
☐ Descripción clara en PR   # Documentación
☐ Screenshots si hay UI     # Visual review
☐ Tests manuales hechos     # QA básico
```

---

## 🏆 **MEJORES PRÁCTICAS**

### **Do's ✅**
- Commits pequeños y frecuentes
- Mensajes descriptivos
- Rebase diario con main
- Code review exhaustivo
- Comunicación constante
- Testing antes de PR
- Documentar cambios complejos

### **Don'ts ❌**
- Commits gigantes de 50+ archivos
- Push directo a main
- Ignorar conflictos de merge
- PRs sin descripción
- Código sin lint/format
- Trabajar días sin sincronizar
- console.log en producción

---

## 🔧 **SETUP INICIAL DEL PROYECTO**

### **1. Configurar pre-commit hooks:**

```bash
# Instalar dependencias
npm install --save-dev husky lint-staged prettier

# Configurar package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### **2. Configurar .gitignore:**
```bash
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/build
/.next/
/out/

# Environment variables
.env*.local
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock
```

---

## 📞 **PROTOCOLO DE COMUNICACIÓN**

### **Canales de comunicación:**

| Urgencia | Canal | Tiempo Respuesta |
|----------|-------|------------------|
| 🚨 Crítico | Llamada/WhatsApp | Inmediato |
| ⚠️ Urgente | Slack/Discord | 15 minutos |
| 📝 Normal | Git PR/Issues | 2-4 horas |
| 📚 Info | Email/Documentación | 24 horas |

### **Daily Standup (15 min diarios):**
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Tengo algún bloqueador?
4. ¿En qué archivos voy a trabajar?

---

## 🎉 **¡WORKFLOW IMPLEMENTADO!**

Con estas prácticas garantizamos:
- ✅ Zero conflictos de merge
- ✅ Código siempre funcionando en main
- ✅ Desarrollo paralelo eficiente
- ✅ Historia de Git limpia
- ✅ Code quality consistente
- ✅ Despliegues sin problemas

---

**📝 Actualizado:** Diciembre 2024
**👥 Para:** Equipo de desarrollo Livinning
**🔄 Versión:** 1.0

---

## 📚 Referencias útiles

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)