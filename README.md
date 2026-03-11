# 🎨 Tablero Colaborativo — ARSW Lab 05



Desarrollo de un tablero interactivo que permite a múltiples usuarios dibujar en
un tablero compartido. El tablero debe permitir a múltiples usuarios dibujar en línea y
proveer un botón de borrado. Lo que cada persona dibuje debe aparecer en el tablero de
todas las otras personas. Cada persona debe iniciar con un color diferente. Cuándo alguien
oprime el botón de borrar el tablero se borra para todas las personas.

---

## ✨ Características

- 🖊️ **Dibujo a mano alzada** — mantén el botón del mouse presionado y muévete para pintar en el lienzo
- 🎨 **Color único por usuario** — cada sesión recibe un color aleatorio para distinguir quién dibujó qué
- 🌐 **Colaboración en tiempo real** — los puntos se sincronizan con todos los usuarios conectados vía WebSocket
- 🗑️ **Limpiar tablero** — borra el lienzo para todos los usuarios con el botón **Borrar**
- ⚡ **Experiencia de desarrollo rápida** — potenciado por Vite con Hot Module Replacement (HMR)

---

## 📋 Requisitos Previos

Antes de ejecutar este proyecto asegúrate de tener instalado:

- **Node.js** ≥ 18 
- **npm** ≥ 9 (viene incluido con Node.js)
- **Backend de Spring Boot** corriendo en `http://localhost:8080` con el endpoint `/ws-boards`



---

## 🗂️ Estructura del Proyecto

```
ARSW-LAB05-FRONTEND/
├── public/                  # Assets estáticos
├── src/
│   ├── App.jsx              # Componente principal — lógica del canvas, p5 y UI
│   ├── App.css              # Estilos del componente
│   ├── main.jsx             # Punto de entrada de React
│   ├── assets/              # Imágenes y recursos
│   └── hooks/
│       └── socketHook.js    # Hook personalizado para STOMP WebSocket
├── index.html               # Template HTML
├── vite.config.js           # Configuración de Vite
├── eslint.config.js         # Configuración de ESLint
└── package.json             # Metadata del proyecto y scripts
```


## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/your-username/ARSW-LAB05-FRONTEND.git
cd ARSW-LAB05-FRONTEND
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en **http://localhost:5173** por defecto.


## 🏗️ Arquitectura

El sistema sigue un modelo publicar/suscribir donde el frontend se comunica con un broker de mensajería (Spring WebSocket + STOMP) en el backend.


## 🔌 WebSocket con STOMP


#### 1. Suscripción a un tópico

Una vez conectado, el cliente se suscribe al **tópico** del board correspondiente:

```js
onConnect: () => {
  stompClient.subscribe(
    `/topic/boards.camilo.${boardName}`,  // Destino del tópico
    (stompMessage) => {
      // stompMessage.body es el JSON serializado del board
      const board = JSON.parse(stompMessage.body);
      onMessageReceivedRef.current(board); // Callback de React
    }
  );
}
```

| Parte | Descripción |
|---|---|
| `/topic/` | Prefijo estándar STOMP para destinos broadcast (todos los suscriptores reciben el mensaje) |
| `boards.camilo` | Namespace del autor/usuario |
| `${boardName}` | Identificador único del board (`board1` por defecto) |

#### 2. Publicar un punto dibujado

```js
const sendMessage = (x, y, color = '#000000') => {
  if (clientRef.current?.connected) {
    clientRef.current.publish({
      destination: '/app/draw',       
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        author: 'camilo',
        name: boardName,
        point: { x, y, color },       
      }),
    });
  }
};
```

#### 3. Publicar el evento de limpiar tablero

```js
const sendClear = () => {
  if (clientRef.current?.connected) {
    clientRef.current.publish({
      destination: '/app/clear',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        author: 'camilo',
        name: boardName,
        point: { x: 0, y: 0, color: '#000000' },
      }),
    });
  }
};
```

#### 4. Desconexión al desmontar el componente

```js
return () => stompClient.deactivate(); // Cleanup de React useEffect
```

### Referencia de destinos STOMP

| Destino | Dirección | Descripción |
|---|---|---|
| `/app/draw` | Cliente → Servidor | Enviar un nuevo punto de dibujo |
| `/app/clear` | Cliente → Servidor | Solicitar limpiar el board |
| `/topic/boards.camilo.{boardName}` | Servidor → Clientes | Recibir el estado actualizado del board |

---

## 🎨 Dibujo con p5.js

### Integración con React (modo instancia)

```js
import p5 from "p5";

useEffect(() => {
  const sketch = (p) => {       // 'p' es la instancia de p5
    p.setup = () => {
      p.createCanvas(700, 410); // Crea el elemento <canvas>
      p.background(220);        // Fondo gris inicial
    };

    p.draw = () => {            // Se ejecuta ~60 veces por segundo
      if (p.mouseIsPressed) {
        p.noStroke();           // Sin borde en el círculo
        p.fill(MY_COLOR);       // Color del usuario actual
        p.ellipse(p.mouseX, p.mouseY, 20, 20); // Dibuja círculo de 20x20px
      }
    };
  };

  // Monta el sketch en el contenedor DOM
  const myp5 = new p5(sketch, containerRef.current);
  p5Ref.current = myp5; // Guardamos la instancia para usarla desde fuera

  return () => myp5.remove(); // Desmonta el canvas al salir del componente
}, []);
```


## Autor

* **Julian Camilo Lopez Barrero** - [JulianLopez11](https://github.com/JulianLopez11)
