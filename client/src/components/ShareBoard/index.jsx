import { useEffect, useState, useLayoutEffect } from 'react';
import rough from 'roughjs/bundled/rough.cjs';
import { Box } from '@mui/material';

const roughGenerator = rough.generator();

const ShareBoard = ({
  canvasRef,
  ctxRef,
  tool,
  color,
  user,
  socket,
  shareUser
}) => {
  const [imageMap, setImageMap] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);

  if(imageMap == null){
    socket.emit('getWhiteBoardData', user.roomId);
  }

  useEffect(() => {
    socket.on('whiteBoardDataResponse', (data) => {
      setImageMap(new Map(data.imgMap));
    });
  }, []);

  // useEffect(() => {
  //   console.log('received sharedWhiteBoardDataResponse')
  //   socket.on('sharedWhiteboardData', (data) => {
  //     if (user.userId == data.receiver) {
  //       drawImageOnCanvas(data.imgurl);
  //     }
  //   });
  // }, []);

  const drawImageOnCanvas = (url) => {
    if (ctxRef && ctxRef.current) {
      var image = new Image();

      image.onload = function () {
        ctxRef.current.drawImage(image, 0, 0);
      };
      image.src = url;
    }
  };

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
    // if (!user?.presenter && imageMap != null) {
    //   if (ctxRef && ctxRef.current) {
    //     ctxRef.current.clearRect(
    //       0,
    //       0,
    //       canvasRef.current.width,
    //       canvasRef.current.height
    //     );
    //     drawImageOnCanvas(imageMap.get(user.hostId));
    //   }
    // } else 
    
    if (shareUser !== null && imageMap !== null) {
      drawImageOnCanvas(imageMap.get(shareUser.userId));
    }
  }, [imageMap]);

  useEffect(() => {
    // if (user?.presenter) {
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setElements([]);
    // }
  }, [shareUser.userId]);


  const drawElements = () => {
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
    }
  };

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

  useEffect(() => {
    if (canvasRef) {
      const roughCanvas = rough.canvas(canvasRef.current);
      if (shareUser !== null && imageMap !== null) {
        drawImageOnCanvas(imageMap.get(shareUser.userId));
      }

      if (elements.length > 0) {
        drawElements();
        const canvasImage = canvasRef.current.toDataURL();
          if(shareUser.isGroup === false){
            socket.emit('sharedWhiteboardData', {
              imgurl: canvasImage,
              receiver: shareUser.userId,
              roomId: user.roomId
            });
          }
          socket.emit('whiteboardData', {
            imgurl: canvasImage,
            uid: shareUser.userId,
            roomId: user.roomId
          });
      }
    }
  }, [elements]);

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

export default ShareBoard;
