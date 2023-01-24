import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { message } from "antd";

const createElement = (id, x1, y1, x2, y2, type) => {
  switch (type) {
    case "text":
      return { id, type, x1, y1, x2, y2, text: "" };
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case "text":
      return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const getElementAtPosition = (x, y, element) => {
  const position = positionWithinElement(x, y, element);
  if (!position) return null;
  return { ...element, position };
};

const cursorForPosition = position => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move" || "text";
  }
};

const drawElement = (context, element) => {
  switch (element.type) {
    case "text":
      context.textBaseline = "top";
      context.font = "24px sans-serif";
      context.fillText(element.text, element.x1, element.y1);
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const ELEMENT = {
  id: 99,
  type: "text",
  text: "budi pergi makan nasi ayam di restoran",
  x1: 100,
  y1: 109,
  x2: 520, //??
  y2: 133,
};

const App = () => {
  // const [elements, setElements] = usePrev([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState(null);
  const textAreaRef = useRef();

  useLayoutEffect(() => {
    // dpr for setting high resolution canvas https://web.dev/canvas-hidipi/
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvas = document.getElementById("canvas");
    // scale down width n height
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const context = canvas.getContext("2d");
    // scale up the text
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw element after switch from 'text' to 'selection'
    // elements.forEach(element => {
    //   if (action === "writing" && selectedElement.id === element.id) return;
    //   drawElement(context, element);
    // });
    drawElement(context, ELEMENT);
  }, [action, selectedElement]);

  // write 'text' into input text
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing") {
      textArea.focus();
      textArea.value = selectedElement.text;
    }
  }, [action, selectedElement]);

  // const updateElement = (id, x1, y1, type, options) => {
  //   // kalo perlu update text value. ganti ELEMENT ke useState
  //   // const elementsCopy = ELEMENT;

  //   switch (type) {
  //     case "text":
  //       //   const textWidth = document
  //       //     .getElementById("canvas")
  //       //     .getContext("2d")
  //       //     .measureText(options.text).width;
  //       //   const textHeight = 24;
  //       //   elementsCopy = {
  //       //     ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
  //       //     text: options.text,
  //       //   };
  //       break;
  //     default:
  //       throw new Error(`Type not recognised: ${type}`);
  //   }

  //   // setElements(elementsCopy, true);
  // };

  const handleMouseDown = event => {
    console.log("handleMouseDown", { action, tool }, [ELEMENT]);
    if (action === "writing") return;

    const { clientX, clientY } = event;
    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, ELEMENT);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });

        // setElements(prevState => prevState);
      }
    } else {
      // const id = elements.length;
      const id = ELEMENT.id;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      // setElements(prevState => [...prevState, element]);
      setSelectedElement(element);

      // setAction(tool === "text" ? "writing" : "drawing");
      setAction("writing");
    }
  };

  const handleMouseMove = event => {
    const { clientX, clientY } = event;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, ELEMENT);
      // console.log(element);
      event.target.style.cursor = element ? cursorForPosition(element.position) : "default";
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setAction("writing");
      } else {
        // setAction("selection");
      }
      // console.log(
      //   document
      //     .getElementById("input")
      //     ?.value?.slice(
      //       document.getElementById("input")?.selectionStart,
      //       document.getElementById("input")?.selectionEnd
      //     )
      // );
    }
  };

  // const handleMouseUp = event => {
  //   // const { clientX, clientY } = event;
  //   // if (selectedElement) {
  //   //   if (
  //   //     selectedElement.type === "text" &&
  //   //     clientX - selectedElement.offsetX === selectedElement.x1 &&
  //   //     clientY - selectedElement.offsetY === selectedElement.y1
  //   //   ) {
  //   //     // buat ganti dari selection ke writing
  //   //     // setAction("writing");
  //   //     return;
  //   //   }
  //   // }
  //   // setAction("none");
  //   // setSelectedElement(null);
  // };

  // const handleBlur = event => {
  //   const { id, x1, y1, type } = selectedElement;
  //   // setAction("none");
  //   // setSelectedElement(null);
  //   updateElement(id, x1, y1, type, { text: event.target.value });
  // };

  const handleClickLabel = () => {
    const inputText = textAreaRef.current;
    setAction("none");
    setSelectedElement(null);
    message.info({
      key: "label",
      content: inputText?.value.slice(inputText.selectionStart, inputText.selectionEnd),
    });
  };

  return (
    <>
      <div style={{ position: "fixed" }}>
        <input
          type="radio"
          id="selection"
          checked={tool === "selection"}
          onChange={() => setTool("selection")}
        />
        <label htmlFor="selection">Selection</label>
        <input type="radio" id="text" checked={tool === "text"} onChange={() => setTool("text")} />
        <label htmlFor="text">Text</label>
        <button type="button" onClick={handleClickLabel} style={{ marginLeft: 20 }}>
          Label
        </button>
      </div>
      {action === "writing" ? (
        <input
          ref={textAreaRef}
          // onBlur={handleBlur}
          id="input"
          style={{
            position: "fixed",
            top: selectedElement.y1 - 2,
            left: selectedElement.x1,
            font: "24px sans-serif",
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: "auto",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            width: "100%",
            // caretColor: "transparent",
            // display: action !== "writing" ? "block" : "hidden",
          }}
        />
      ) : null}
      <canvas
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </>
  );
};

export default App;
