# Offerly Copilot

Monorepo con frontend Tauri + React en la raiz y API NestJS en `apps/api`.

## Estructura

```text
.
├── apps/
│   └── api/        # Backend NestJS
├── src/            # Frontend React
├── src-tauri/      # Shell nativo de Tauri
├── package.json
└── package-lock.json
```

## Instalar dependencias

```bash
npm install
```

El repositorio usa `npm workspaces`, asi que un solo `npm install` en la raiz instala el frontend y el backend.

## Scripts principales

```bash
npm run dev:web     # Frontend Vite
npm run dev:api     # API NestJS
npm run build       # Build de frontend + API
npm run build:web   # Solo frontend
npm run build:api   # Solo API
npm run start:api   # Inicia la API
npm run test:api    # Tests del backend
```

## Setup recomendado

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
