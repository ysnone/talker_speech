# Talker - Asistente de Voz con ElevenLabs

## Desarrollado por
[Yerson Crespo](https://ysnone.com) - YSNOne 2024

## Descripción del Proyecto
Talker es una aplicación Node.js que integra la API de ElevenLabs para proporcionar capacidades de texto a voz (TTS) con voces realistas. La aplicación permite generar y reproducir audio a partir de texto, con control sobre la reproducción y los dispositivos de audio.

## Características Principales

### Integración con ElevenLabs
- Conversión de texto a voz usando la API de ElevenLabs
- Soporte para múltiples voces y configuraciones de voz
- Manejo eficiente de las respuestas de audio en formato MP3

### Gestión de Audio
- Reproducción de audio directamente desde el servidor
- Control de dispositivos de audio en Windows
- Capacidad para seleccionar y cambiar dispositivos de salida de audio
- Opción para habilitar/deshabilitar la reproducción automática

### API REST
- Endpoint `/api/el/speak` para generación y reproducción de voz
- Parámetro `offDevice` para controlar la reproducción automática
- Respuestas en formato buffer para integración flexible

## Arquitectura Técnica

### Estructura del Proyecto
```
talker_v1/
├── src/
│   ├── controllers/
│   │   └── elController.js     # Controlador para ElevenLabs
│   ├── services/
│   │   └── audioDeviceService.js # Servicio de gestión de audio
│   └── server.js               # Servidor Express
├── package.json
└── README.md
```

### Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **MongoDB**: Base de datos (vía Mongoose)
- **sound-play**: Librería para reproducción de audio
- **node-fetch**: Cliente HTTP para llamadas a la API
- **dotenv**: Manejo de variables de entorno

### Dependencias Principales
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "node-fetch": "^3.3.2",
    "sound-play": "^1.1.0"
  }
}
```

## Configuración y Uso

### Variables de Entorno Requeridas
- `ELEVENLABS_API_KEY`: Clave de API para ElevenLabs
- `MONGODB_URI`: URI de conexión a MongoDB

### Endpoints API

#### POST /api/el/speak
Genera y reproduce audio a partir de texto.

**Parámetros:**
- `text`: Texto a convertir en voz
- `offDevice` (opcional): Si es true, no reproduce el audio automáticamente

**Respuesta:**
- Buffer de audio en formato MP3

### Gestión de Dispositivos de Audio

El servicio `audioDeviceService.js` proporciona las siguientes funcionalidades:
- Listar dispositivos de audio disponibles
- Obtener el dispositivo predeterminado
- Cambiar el dispositivo predeterminado
- Reproducir audio en el dispositivo seleccionado

## Historial de Desarrollo

### Versión Actual
- Tag: `Api_reproduction_ok`
- Implementación exitosa de reproducción de audio usando `sound-play`
- Integración completa con ElevenLabs API
- Sistema de gestión de dispositivos de audio funcional

### Cambios Significativos
1. Migración de sistemas de reproducción de audio:
   - Inicialmente: `speaker` (requería Visual Studio Build Tools)
   - Luego: `node-wav-player` (limitado a archivos WAV)
   - Finalmente: `sound-play` (solución robusta para MP3)

2. Mejoras en el manejo de audio:
   - Implementación de sistema de archivos temporales
   - Gestión automática de limpieza de archivos
   - Control de reproducción configurable

## Próximos Pasos y Mejoras Propuestas

1. **Funcionalidades**
   - Caché de audio para textos frecuentes
   - Soporte para más formatos de audio
   - Cola de reproducción para múltiples solicitudes

2. **Técnicas**
   - Implementar tests automatizados
   - Mejorar el manejo de errores
   - Documentación API con Swagger
   - Sistema de logs más detallado

3. **Optimizaciones**
   - Streaming de audio para respuestas largas
   - Compresión de audio configurable
   - Manejo de concurrencia en reproducción

## Notas de Desarrollo
- La aplicación está optimizada para Windows debido al uso de PowerShell para la gestión de dispositivos de audio
- Se recomienda mantener actualizadas las dependencias para compatibilidad
- El sistema de archivos temporales requiere permisos de escritura en el directorio temp del sistema
