# 🏫 Plataforma Educativa MonteVerde

> ⚠️ **Nota Importante:** Este proyecto representa un **MVP (Minimum Viable Product) o Prototipo**. Contiene las bases arquitectónicas funcionales clave para la demostración del ecosistema, pero no es una aplicación final completa apta para producción masiva sin previo refinamiento.

![Monteverde App](https://img.shields.io/badge/Plataforma-Mobile_First-purple.svg)
![React Native](https://img.shields.io/badge/Frontend-React_Native_%2B_Expo-blue.svg)
![Flask](https://img.shields.io/badge/Backend-Python_Flask-green.svg)
![MySQL](https://img.shields.io/badge/Base_de_Datos-MySQL-orange.svg)

##  1. Descripción general del proyecto

**Propósito:**  
La plataforma educativa MonteVerde es una solución unificada nativa que conecta digitalmente a la institución con su comunidad. Sirve como un portal de servicios móviles permitiendo la comunicación, evaluación y trazabilidad de los procesos formativos en tiempo real.

**Problema que resuelve:**  
Suprime las barreras de comunicación tradicionales (circulares en papel, cuadernos de notas, citas presenciales difusas) logrando centralizar y digitalizar reportes académicos, mensajería directa e instantánea entre familias y docentes, y tableros estadísticos en una aplicación ligera y accesible 24/7.

**Público objetivo:**  
* **Familias/Acudientes:** Para auditar notas y contactar profesores.
* **Docentes/Profesores:** Para gestionar aulas, comunicarse con directores de curso y familias.
* **Administradores:** Coordinación y sistema directivo.

---

##  2. Arquitectura del sistema

El sistema está cimentado en un patrón arquitectónico de **Micro-Monolito Cliente-Servidor**.

### ▶ Explicación del Backend (Python / Flask)
* **Estructura y responsabilidades:** El backend funciona como un monolito API RESTful sin estado (*Stateless*). Se encarga en su totalidad de las transacciones hacia la base de datos `monteverde_db`. Gestiona la encriptación de identidades mediante **JSON Web Tokens (JWT)** para la hidratación y control de acceso de la sesión.
* **Flujo:** Las requisiciones llegan por CORS, pasan por `jwt.decode` para la verificación de origen y credenciales, se abre un cursor explícito y asilado hacia la DataBase y finalmente se devuelve una respuesta unificada en notación JSON estándar (`success`, `data`, `message`).

### ▶ Explicación del Frontend (React Native & Expo)
* **Estructura:** Se fundamenta en **Expo Router**. Utiliza un layout condicional de pestañas (`_layout.tsx`) dependiendo del estatus y los permisos del rol del usuario hidratados desde una memoria segura local mediante `expo-secure-store`.
* **Componentes principales:** 
  - *Context Providers:* `AuthContext` administra universalmente quién navega en la App.
  - *Servicios de Red:* `api.ts` inyecta dinámicamente los Tokens autorizados garantizando un Gateway seguro al backend.
  - *Vistas Dinámicas:* Pantallas segregadas entre `(familia)` y `(docente)`, compartiendo componentes visuales reutilizables como Modales, Tablas y Botones.

### 🔄 Diagrama del flujo general
```text
[ Móvil (React Native) ] ----- ( HTTP / JSON ) -----> [ API Gateway (app.py) ]
          |                                                   |
 (Renderiza UI / UX)                        (Gestión y Lógica de Negocio / JWT)
          |                                                   |
          |               <---- ( Respuestas JSON ) ----      |
   (Expo Router)                                        [ MySQL Database ]
          |                                            (Almacenamiento Persistente)
(AuthContext / SecureStore)
```

---

## 🛠️ 3. Tecnologías utilizadas

### Frontend (App Móvil)
* **Lenguaje:** TypeScript / JavaScript
* **Framework:** React Native con **Expo**.
* **Librerías principales:** 
  - `expo-router` (rutas anidadas y navegación estructural).
  - `expo-secure-store` (persistencia y seguridad de JWTs locales).

### Backend (Servidor)
* **Lenguaje:** Python (3.x)
* **Framework:** Flask (API Rest)
* **Librerías principales:** `flask-cors`, `mysql-connector-python`, `PyJWT` (Autenticación e identidades).

### Base de datos
* **Motor:** MySQL (`monteverde_db`).

---

## 📂 4. Estructura del proyecto

```bash
monteverde/
├── backend/                  # Código fuente del servidor
│   ├── app.py                # Single-point gateway del API RESTful Core.
│   └── src/                  # Estructura modular del backend
│       ├── models/           # Definiciones de modelos de datos (ORM/Queries)
│       ├── routes/           # Controladores y agrupadores de Endpoints
│       ├── utils/            # Funciones utilitarias y middlewares
│       └── extensions/       # Configuraciones y conexiones externas
│
├── mobile/                   # Root del frontend Expo
│   ├── app/                  # Sistema de enrutamiento basado en archivos
│   │   ├── (auth)/           # Pantallas de Login y validación de tokens
│   │   ├── (docente)/        # Módulos y dashboards exclusivos para profesores
│   │   └── (familia)/        # Boletines y mensajería orientada a tutores/acudientes
│   │
│   ├── components/           # Componentes UI universales (Tablas, HeaderBar)
│   ├── contexts/             # Proveedores globales de estado (Autenticación)
│   └── services/             # Capa del Orquestador HTTP y utilidades con fetch
│
└── README.md                 # Archivo de documentación.
```

---

## 🚀 5. Guía de instalación y ejecución

### Requisitos previos
1. **Node.js**: (Recomendado v18+).
2. **Python**: (Recomendado v3.10+).
3. **Servidor MySQL**: (XAMPP, WAMP o nativo en tu máquina con el root abierto o configurado).
4. **App Expo Go**: (Se recomienda instalarla en el móvil, disponible en PlayStore / AppStore para tests rápidos en vivo).

### Configuración del entorno

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd monteverde
```

2. **Base de Datos:**
Crea la base de datos `monteverde_db` en tu Gestor SQL e importa el archivo SQL incluido en la raíz de este repositorio. Este archivo ya contiene toda la estructura necesaria y un volcado de **datos de prueba (usuarios, docentes y familias)** para que puedas probar el sistema inmediatamente.

3. **Backend:**
Es altamente recomendado el uso de un entorno virtual (venv) para evitar conflictos de dependencias.
```bash
# Navegar a la carpeta backend
cd backend

# Aislar el entorno virtual y activarlo (Windows)
python -m venv venv
venv\Scripts\activate

# Instalar dependencias dentro del entorno
pip install -r requirements.txt
# (o manualmente: pip install flask flask-cors mysql-connector-python pyjwt)

# Correr el servidor localmente (Puerto base 5000)
python app.py
```

4. **Frontend:**
```bash
# Abrir nueva terminal y navegar a la carpeta de la app móvil
cd mobile

# Instar dependencias (Node Modules)
npm install

# Lanzar Expo bundler
npx expo start
```
*Atención:* En un emulador o simulador puedes pulsar `i` (iOS) o `a` (Android). Si usas tu propio dispositivo, escanea el código QR lanzado por la consola desde la aplicación secundaria *Expo Go*.

---

## 📖 6. Uso del sistema

* **Ingreso:** Al abrir la App, llegarás a la pantalla de Autenticación. Ingresa las credenciales del docente o familia creadas administrativamente en el backend.
* **Familias:** Tras ingresar notarás que la navegación inferior ("Tabs") expone botones hacia las Calificaciones (vista analítica de boletines por periodo) o al Tablero de Mensajes para comunicación de contacto primario con educadores asignados.
* **Docentes:** Notarás un menú con amplias gestiones, para revisión de cursos a cargo y bandejas de entrada cruzadas.

---

## ✅ 7. Buenas prácticas de contribución

* **Diseño Orientado al Usuario:** Siempre mantén interfaces minimalistas, claras y escalables, evitando saturar la App con botones o acciones redundantes (como se reubicó correctamente el botón Salir).
* **Gestión de Fechas Nativas (DB):** Es altamente imperativo manejar extracciones de fechas limpios provenientes de Python (`.isoformat()`) al exportar JSONs y esquivar la función `DATE_FORMAT()` con caracteres de porcentaje `%` desde la base de datos de MySQL para evitar colisiones con el driver Python `mysql-connector`.
* **Hooks de Auth:** Si necesitas requerir protección de recursos, inyecta siempre las utilidades seguras del middleware frontend `<ProtectedRoute />` junto a `const { user } = useAuth();` en lugar de manipular `SecureStore` manualmente con fines de visualización general.


