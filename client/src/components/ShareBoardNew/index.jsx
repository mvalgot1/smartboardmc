import { useEffect, useState, useLayoutEffect } from 'react';
import rough from 'roughjs/bundled/rough.cjs';
import { Box } from '@mui/material';

const roughGenerator = rough.generator();

const ShareBoardNew = ({
  user,
  socket,
  setShareBoardName
}) => {
  const [imageMap, setImageMap] = useState(null);
  const [shareId, setShareId] = useState(null);

  if(shareId == null){
    socket.emit('getShareId', user.roomId);
  }
  if(imageMap == null){
    socket.emit('getWhiteBoardData', user.roomId);
  }

  useEffect(() => {
    socket.on('whiteBoardDataResponse', (data) => {
      // console.log('wb resp');
      // console.log(data);
      setImageMap(new Map(data.imgMap));
    });
  }, []);

  useEffect(() => {
    socket.on('shareIdResponse', (data) => {
      // console.log('share id resp');
      // console.log(data)
      setShareId(data.userId);
      setShareBoardName(data.userName);
    });
  }, []);

  return (

    <Box
      component="img"
      className="border border-dark border-3 overflow-hidden"
      sx={{ maxHeight: '700px' }}
      src={(shareId !== null && imageMap !== null) ? imageMap.get(shareId) : null}
      alt="share board"
    />
  );
};

export default ShareBoardNew;
