# Meetup Frontend

Frontend de Meetup Football, una plataforma para organizar y unirse a partidos de fútbol.  
Construido con React y Vite, ofrece una experiencia completa de usuario con autenticación, inscripción a partidos, comentarios y control de permisos.

## Tecnologías

- React + Vite
- React Router para navegación
- Context API para autenticación
- CSS modular (`*.module.css`)
- Fetch API para comunicación con backend

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/gregoridelrio/meetup-frontend.git
cd meetup-frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Levantar servidor de desarrollo
```bash
npm run dev
```

3. Una vez iniciado el servidor, accede a:
```bash
http://localhost:5173
```

## Estructura principal
```bash
src/
├─ components/        # Componentes reutilizables
├─ context/           # AuthContext
├─ pages/             # Vistas principales (MatchesIndex, MatchDetail)
├─ router/            # Rutas protegidas
├─ styles/            # CSS modules
└─ main.jsx           # Punto de entrada Vite
```
