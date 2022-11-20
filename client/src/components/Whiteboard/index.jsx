import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import rough from 'roughjs/bundled/rough.cjs';
import { Box } from '@mui/material';

const roughGenerator = rough.generator();

const WhiteBoard = ({
  canvasRef,
  ctxRef,
  tool,
  color,
  user,
  socket,
  screenShareId,
  screenShareName,
  isBoardCleared,
  setIsBoardCleared
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [selfImage, setSelfImage] = useState('');
  const [elements, setElements] = useState([]);

  console.log('board c')
  console.log(isBoardCleared)

  // if(isBoardCleared) {
  //   setElements([]);
  //   setIsBoardCleared(false);
  //   isBoardCleared=false
  // }
  // let isStarted = useRef(false);

  // console.log(isStarted.current);

  // const listener = (data) => {
  //   setImageMap(new Map(data.imgMap));
  // };

  // useEffect(() => {
  //   console.log('requestBoard')
  //   socket.emit('requestBoard', {roomId : user.roomId})
  // }, [])

  // useEffect(() => {
  //   console.log('removing socket listener')
  //   socket.removeListener('whiteBoardDataResponse');
  //   socket.on('whiteBoardDataResponse', listener);
  // }, []);

  useEffect(() => {
    console.log('cleared board')
    setElements([])
  }, [isBoardCleared]);
  
  useEffect(() => {
    console.log('make elements empty')
    setElements([])
  }, []);

  if(userImage == null){
    // console.log('getWhiteBoardData')
    socket.emit('getUserWhiteBoardData', user.userId);
  }


  useEffect(() => {
    // console.log('userWhiteBoardResponse')
    socket.on('userWhiteBoardResponse', (data) => {
      // console.log('userWhiteBoardResponse')
      // console.log(data);
      setUserImage(data);
    });
    // if (imageMap !== null && imageMap.has(user.userId) ) {
    //   console.log('map has image')
    //   drawImageOnCanvas(imageMap.get(user.userId));
    // }
  }, []);

  useEffect(() => {
    // console.log('received sharedWhiteBoardDataResponse')
    socket.on('sharedWhiteBoardDataResponse', (data) => {
      if (user.userId == data.receiver) {
        drawImageOnCanvas(data.imgurl);
      }
    });
  }, []);

  // useEffect(() => {
  //   if (ctxRef && ctxRef.current) {
  //     const canvasImage = canvasRef.current.toDataURL();
  //     setSelfImage(canvasImage);
  //     ctxRef.current.clearRect(
  //       0,
  //       0,
  //       canvasRef.current.width,
  //       canvasRef.current.height
  //     );
  //   }
  //   if (screenShareId !== '') {
  //     setIsDrawing(false);

  //     if (imageMap !== null && imageMap.has(screenShareId)) {
  //       drawImageOnCanvas(imageMap.get(screenShareId));
  //     }
  //   } else {
  //     drawElements();
  //   }
  // }, [screenShareId]);

  // useLayoutEffect(() => {
  //   if (
  //     screenShareId !== '' &&
  //     imageMap !== null &&
  //     imageMap.has(screenShareId)
  //   ) {
  //     socket.emit('whiteboardData', {
  //       imgurl: imageMap.get(screenShareId),
  //       uid: user.userId,
  //       roomId: user.roomId
  //     });
  //   } else if (imageMap !== null && imageMap.has(user.userId)) {
  //     socket.emit('whiteboardData', {
  //       imgurl: selfImage,
  //       uid: user.userId,
  //       roomId: user.roomId
  //     });
  //   }
  // }, [screenShareId]);

  useEffect(() => {
    // console.log('canvas changed')
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctxRef.current = ctx;
    // console.log('initial elements')
    // console.log(elements)
  }, []);

  useEffect(() => {
    // console.log('elements changed')
    if (canvasRef) {
      // console.log('enetered elemenrs if')
      // console.log('user image')
      // console.log(userImage)
      // console.log(elements)
      // console.log(isStarted.current)
      if(isBoardCleared) {
        setElements([]);
        setIsBoardCleared(false);
        // isBoardCleared=false
      }
      if (userImage !== null){
        drawImageOnCanvas(userImage);
      }
      if (elements.length > 0) {
        drawElements();
        // isStarted.current = true;
        const canvasImage = canvasRef.current.toDataURL();
        // console.log('sending canvas image')
        // console.log(canvasImage)
        socket.emit('whiteboardData', {
          imgurl: canvasImage,
          uid: user.userId,
          roomId: user.roomId
        });
      }
    }
  }, [elements]);

  useEffect(() => {
    // console.log('load image')
    // console.log(userImage)
    // console.log(user.userId)
    if (userImage !== null) {
      // console.log('map has image')
      drawImageOnCanvas(userImage);
    }
  }, [userImage])

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
    // if (screenShareId === '') {
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
    // }
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

export default WhiteBoard;
