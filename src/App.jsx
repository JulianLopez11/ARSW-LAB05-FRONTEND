import { useRef, useEffect, useCallback } from "react";
import p5 from "p5";
import useSocket from "./hooks/socketHook";


//Para los colores diferentes de cada usuario
//El color se genera cada que se recarga la pagina por si las moscas
const randomColor = () =>
  "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");

//Valores Iniciales
const MY_COLOR = randomColor();
const BOARD_NAME = "board1";
const BOARD_AUTHOR = "camilo";

function App() {
  const containerRef = useRef();
  const p5Ref = useRef();
  const sendMessageRef = useRef();
  const sendClearRef = useRef();

  const onMessageReceived = useCallback((board) => {
    const p = p5Ref.current;
    if (!p) return;

    p.background(220);

    if (board.points && board.points.length > 0) {
      board.points.forEach((point) => {
        p.noStroke();
        p.fill(point.color || "#000000");
        p.ellipse(point.x, point.y, 20, 20);
      });
    }
  }, []);

  //Uso del socket
  const { sendMessage, sendClear } = useSocket(
    BOARD_AUTHOR,
    BOARD_NAME,
    onMessageReceived
  );

  useEffect(() => {
    sendMessageRef.current = sendMessage;
    sendClearRef.current = sendClear;
  }, [sendMessage, sendClear]);


  //P5 xd
  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(700, 410);
        p.background(220);
      };

      p.draw = () => {
        if (p.mouseIsPressed) {
          p.noStroke();
          p.fill(MY_COLOR);
          p.ellipse(p.mouseX, p.mouseY, 20, 20);

          if (sendMessageRef.current) {
            sendMessageRef.current(p.mouseX, p.mouseY, MY_COLOR);
          }
        }
      };
    };

    const myp5 = new p5(sketch, containerRef.current);
    p5Ref.current = myp5;

    return () => myp5.remove();
  }, []);

  const handleClear = () => {
    if (p5Ref.current) {
      p5Ref.current.background(220);
    }
    if (sendClearRef.current) {
      sendClearRef.current();
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Tablero Colaborativo</h1>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
        <button onClick={handleClear}>Borrar</button>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <span
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: MY_COLOR,
              display: "inline-block",
              border: "1px solid #aaa",
            }}
          />
          <span>Tu color</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <div ref={containerRef}></div>
      </div>
    </div>
  );
}

export default App;