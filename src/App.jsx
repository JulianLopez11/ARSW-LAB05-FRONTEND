import { useRef, useEffect } from "react";
import p5 from "p5";

function App() {
  const containerRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(700, 410);
        p.background(220);
      };

      p.draw = () => {
        if (p.mouseIsPressed) {
          p.fill(0);
          p.ellipse(p.mouseX, p.mouseY, 20, 20);
        }
      };
    };

    const myp5 = new p5(sketch, containerRef.current);

    return () => myp5.remove();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Tablero Colaborativo</h1>
      <button>Hola</button>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <div ref={containerRef}></div>
      </div>
    </div>
  );
}

export default App;