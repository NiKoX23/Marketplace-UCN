# Marketplace UCN

Este proyecto es una plataforma de marketplace diseñada para la comunidad de la Universidad Católica del Norte (UCN). Permite a los usuarios publicar archivos, chatear en tiempo real y gestionar perfiles, todo bajo un entorno seguro con autenticación local y Google OAuth2.

## 🚀 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes:

- [Docker](https://www.docker.com/get-started) y [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v20 o superior, si planeas ejecutarlo sin Docker)
- [Git](https://git-scm.com/)

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Marketplace-UCN
```

### 2. Configurar variables de entorno
El proyecto ya cuenta con un archivo `.env` en la raíz. Asegúrate de que las credenciales coincidan con tu entorno local. Si necesitas probar el flujo de Google OAuth, deberás configurar tus propias credenciales en la [Consola de Google Cloud](https://console.cloud.google.com/).

### 3. Ejecutar con Docker (Recomendado)
Para levantar todos los servicios (Frontend, Backend y Base de Datos) de una sola vez:

```bash
docker-compose up --build -d
```

Esto descargará las imágenes necesarias, instalará las dependencias y dejará el proyecto corriendo en:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)
- **Base de Datos (PostgreSQL):** Puerto 5432

---

## 💻 Ejecución Manual (Sin Docker)

Si prefieres ejecutar los servicios manualmente, sigue estos pasos:

### Backend (NestJS)
1. Entra a la carpeta backend: `cd backend`
2. Instala dependencias: `npm install --legacy-peer-deps`
3. Inicia el servidor de desarrollo: `npm run start:dev`

### Frontend (React + Vite)
1. Entra a la carpeta frontend: `cd frontend`
2. Instala dependencias: `npm install --legacy-peer-deps`
3. Inicia el servidor de desarrollo: `npm run dev`

---

## ⚠️ Notas Importantes

### Dependencias y Conflictos
Debido a la estructura de dependencias de NestJS y React, es **obligatorio** usar el flag `--legacy-peer-deps` al instalar paquetes localmente para evitar conflictos de versiones de "peer dependencies".

```bash
npm install --legacy-peer-deps
```

### Cambios Recientes
- Se ha corregido la configuración de tipos en `tsconfig.json`.
- Se han actualizado las versiones de paquetes críticos (`@supabase/supabase-js`, `pg`, `vite`, etc.) a versiones estables.
- Se ha implementado el campo `username` (@tag) para todos los usuarios.

---

## 📦 Tecnologías Utilizadas
- **Backend:** NestJS, TypeORM, PostgreSQL, Socket.io, Passport.js.
- **Frontend:** React, Vite, PrimeReact, PrimeIcons.
- **Almacenamiento:** Supabase Storage.
- **Contenerización:** Docker / Docker Compose.
