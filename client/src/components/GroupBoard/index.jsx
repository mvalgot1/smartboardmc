import { useEffect, useState } from 'react';
import rough from 'roughjs/bundled/rough.cjs';
import { Box } from '@mui/material';

const roughGenerator = rough.generator();

const GroupBoard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  user,
  socket
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageMap, setImageMap] = useState(null);

  useEffect(() => {
    socket.on('sharedWhiteBoardDataResponse', (data) => {
      if (user.groupId == data.receiver) {
        drawImageOnCanvas(data.imgurl);
      }
    });
  }, []);

  useEffect(() => {
    socket.on('whiteBoardDataResponse', (data) => {
      setImageMap(new Map(data.imgMap));
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (imageMap !== null && imageMap.has(user.groupId)) {
      drawImageOnCanvas(imageMap.get(user.groupId));
    }
  }, [imageMap]);

  useEffect(() => {
    if (canvasRef) {
      const roughCanvas = rough.canvas(canvasRef.current);

      elements.forEach((element) => {
        if (element.type == 'line') {
          roughCanvas.draw(
            roughGenerator.line(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 5,
                roughness: 0
              }
            )
          );
        } else if (element.type == 'pencil') {
          roughCanvas.linearPath(element.path, {
            stroke: element.stroke,
            strokeWidth: 5,
            roughness: 0
          });
        }
      });
      if (elements.length > 0) {
        const canvasImage = canvasRef.current.toDataURL();
        socket.emit('whiteboardData', {
          imgurl: canvasImage,
          uid: user.groupId,
          roomId: user.roomId
        });
      }
    }
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool == 'pencil') {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: 'pencil',
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color
        }
      ]);
    } else if (tool == 'line') {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: 'line',
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color
        }
      ]);
    }
    setIsDrawing(true);
  };

  const drawImageOnCanvas = (url) => {
    if (ctxRef && ctxRef.current) {
      var image = new Image();

      image.onload = function () {
        ctxRef.current.drawImage(image, 0, 0);
      };
      image.src = url;
    }
  };
  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
      if (tool == 'pencil') {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];

        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index == elements.length - 1) {
              return {
                ...ele,
                path: newPath
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool == 'line') {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index == elements.length - 1) {
              return {
                ...ele,
                width: offsetX,
                height: offsetY
              };
            } else {
              return ele;
            }
          })
        );
      }
    }
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-dark border-3 overflow-hidden"
      sx={{ maxHeight: '700px' }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default GroupBoard;
