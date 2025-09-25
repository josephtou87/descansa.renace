# Guía de Configuración de API-Football.com

## 🚀 Configuración Rápida

### 1. Obtener API Key Gratuita

1. **Ve a API-Football.com**
   - Visita: https://www.api-football.com/
   - Haz clic en "Get Started"

2. **Crea tu cuenta**
   - Registra una cuenta gratuita
   - Verifica tu email

3. **Obtén tu API Key**
   - Ve a tu Dashboard
   - Copia tu API key personal

### 2. Configurar en tu Proyecto

1. **Abre el archivo `api.js`**
2. **Busca esta línea:**
   ```javascript
   this.apiKey = 'YOUR_API_KEY_HERE';
   ```
3. **Reemplaza con tu API key real:**
   ```javascript
   this.apiKey = 'tu-api-key-aqui';
   ```

### 3. Verificar Funcionamiento

1. **Abre la consola del navegador** (F12)
2. **Recarga la página**
3. **Busca el mensaje:** `API Status: {valid: true, message: "API key válida"}`

## ✅ Beneficios del Plan Gratuito

- **100 llamadas por día**
- **Resultados reales de Liga MX**
- **Partidos en vivo actualizados**
- **Datos de Champions League**
- **Ligas europeas principales**

## 🔧 Endpoints Disponibles

### Liga MX (ID: 262)
```javascript
// Partidos de hoy y ayer
await window.FootballAPI.getLigaMXMatches();

// Partidos en vivo
await window.FootballAPI.getLiveLigaMXMatches();

// Tabla de posiciones
await window.FootballAPI.getLigaMXStandings();
```

### Champions League (ID: 2)
```javascript
// Partidos recientes
await window.FootballAPI.getChampionsLeagueMatches();
```

### Ligas Principales
```javascript
// Premier League (ID: 39)
await window.FootballAPI.getMatchesByLeague(39);

// La Liga (ID: 140)
await window.FootballAPI.getMatchesByLeague(140);

// Bundesliga (ID: 78)
await window.FootballAPI.getMatchesByLeague(78);

// Serie A (ID: 135)
await window.FootballAPI.getMatchesByLeague(135);
```

## 🛠️ Solución de Problemas

### Error: "API key no configurada"
- Verifica que hayas reemplazado `YOUR_API_KEY_HERE` con tu clave real

### Error: "API key inválida"
- Verifica que tu API key sea correcta
- Asegúrate de no tener espacios extra

### Error: "límite excedido"
- Has usado tus 100 llamadas diarias
- Espera hasta el siguiente día o actualiza tu plan

### No se muestran partidos
- Verifica que sea temporada activa
- Algunos días pueden no tener partidos programados

## 📞 Soporte

- **Documentación oficial:** https://www.api-football.com/documentation
- **Cobertura de ligas:** https://www.api-football.com/coverage
- **Estado de la API:** https://www.api-football.com/status

## 🎯 Resultado Esperado

Una vez configurado correctamente, verás:
- ✅ Resultados reales de Liga MX
- ✅ Partidos en vivo con minutos transcurridos
- ✅ Actualización automática cada 30 segundos
- ✅ Datos de ligas europeas principales
- ✅ Tabla de posiciones actualizada
