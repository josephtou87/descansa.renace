# Guía de Uso de Assets y Multimedia

## 📁 Estructura de Carpetas

```
assets/
├── images/
│   ├── players/          # Fotos de jugadores
│   ├── teams/           # Logos de equipos rivales
│   └── gallery/         # Fotos y videos del equipo
```

## 🏃‍♂️ Fotos de Jugadores

### Ubicación: `assets/images/players/`

### Especificaciones:
- **Formato**: JPG o PNG
- **Tamaño**: 300x300 píxeles mínimo
- **Nombre**: Nombre del jugador en minúsculas, sin espacios, con guiones
- **Ejemplo**: `juan-perez.jpg`

### Cómo agregar:
1. Sube la foto a `assets/images/players/`
2. Nombra el archivo según el nombre del jugador
3. El sistema automáticamente detectará y usará la foto

## ⚽ Logos de Equipos

### Ubicación: `assets/images/teams/`

### Especificaciones:
- **Formato**: PNG con fondo transparente
- **Tamaño**: 80x80 píxeles
- **Nombre**: Nombre del equipo en minúsculas, sin espacios, con guiones
- **Ejemplo**: `club-deportivo.png`

### Cómo agregar:
1. Sube el logo a `assets/images/teams/`
2. Nombra el archivo según el nombre del equipo
3. El sistema automáticamente mostrará el logo en los partidos

## 📸 Galería Multimedia

### Ubicación: `assets/images/gallery/`

### Especificaciones:
- **Fotos**: JPG, PNG (mínimo 800x600 píxeles)
- **Videos**: MP4, WebM
- **Nombre**: Descriptivo con fecha si es posible

### Cómo agregar:
1. Sube el contenido a `assets/images/gallery/`
2. El sistema automáticamente lo mostrará en la galería

## 🌐 Redes Sociales

### Configuración en `social-config.js`:

```javascript
const socialMediaConfig = {
    facebook: {
        url: 'https://facebook.com/fcdescansa',
        icon: 'fab fa-facebook-f',
        color: '#1877f2',
        name: 'Facebook'
    },
    // ... más redes sociales
};
```

### Cómo actualizar:
1. Edita `social-config.js`
2. Cambia las URLs por las reales de tu equipo
3. Agrega o quita redes sociales según necesites

## 🎨 Personalización

### Colores de Redes Sociales:
- **Facebook**: #1877f2
- **Instagram**: #e4405f
- **TikTok**: #000000
- **YouTube**: #ff0000
- **Twitter**: #1da1f2
- **WhatsApp**: #25d366

### Iconos Disponibles:
- Font Awesome 6.0.0
- Bootstrap Icons 1.11.0

## 📱 Responsive Design

Las redes sociales se adaptan automáticamente:
- **Desktop**: Muestran icono + texto
- **Mobile**: Solo muestran iconos más grandes

## 🔧 Funciones JavaScript Disponibles

### Actualizar enlaces sociales:
```javascript
updateSocialLinks();
```

### Agregar nueva red social:
```javascript
addSocialLink('twitter', containerElement);
```

### Obtener estadísticas:
```javascript
const stats = getSocialStats();
```

## 📋 Lista de Tareas

### Para completar la configuración:

1. **✅ Crear carpetas de assets**
2. **✅ Configurar redes sociales**
3. **🔄 Subir fotos de jugadores**
4. **🔄 Subir logos de equipos**
5. **🔄 Subir contenido multimedia**
6. **🔄 Actualizar URLs de redes sociales**

## 🚀 Despliegue

Después de agregar assets:
1. Haz commit de los cambios
2. Push a GitHub
3. Vercel se actualizará automáticamente

## 💡 Consejos

- **Optimiza imágenes** antes de subirlas
- **Usa nombres descriptivos** para los archivos
- **Mantén consistencia** en el formato de nombres
- **Respalda** las imágenes importantes
- **Actualiza** las URLs de redes sociales con las reales
