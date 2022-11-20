import { AgoraVideoPlayer } from 'agora-rtc-react';
import { Grid } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { Stack, Box, Paper } from "@mui/material";
import './index.css';

export default function Video(props) {
  const {
    users,
    tracks,
    userMap,
    user,
    screenShareId,
    setScreenShareId,
    setShareUser,
    setScreenShareName,
    socket
  } = props;
  const [gridSpacing, setGridSpacing] = useState(12);

  const onNameClick = (usr) => {
    if(usr.userId == user.userId || usr.userId == 'shareboard' || user.host || usr.groupMembers.includes(user.userId)){
      setShareUser(usr);
    if (usr.name === user.name) {
      usr.name = 'Me';
    }
    setShareUser(usr);

    socket.emit('requestBoard', {
      id: usr.userId,
      uid: user.userId,
      roomId: user.roomId
    });
    }
  };

  const shareScreen = (isAnonymous, userId, userName) => {
    setScreenShareId(userId);
    setScreenShareName(userName);
    socket.emit('updateShareId', {
      roomId: user.roomId,
      shareId: userId,
      shareName: userName
    });
  };

  const stopSharing = () => {
    setScreenShareId('');
    setScreenShareName('');
    socket.emit('updateShareId', {
      roomId: user.roomId,
      shareId: user.hostId,
      shareName: 'Instructor'
    });
  };

  return (
    <Box container style={{ height: '100%' }}>
      <Stack spacing={2}>
        {/* <Grid item xs={gridSpacing}>
          <AgoraVideoPlayer
            videoTrack={tracks[1]}
            style={{ height: '100%', width: '100%' }}
          />
        </Grid> */}
        <p
          className="my-2 w-100"
          onClick={() => onNameClick({userId: 'shareboard', name: 'Share Board'})}
        >
          Share Board
        </p>
        <p
          className="my-2 w-100"
          onClick={() => onNameClick(user)}
        >
          You
        </p>
      {users.length > 0 &&
        users
          .filter((usr) => usr.userId !== user.userId)
          .map((usr, index) => {
            return (
              <div>
                {/* {usr.userId in userMap && userMap[usr.userId].videoTrack && (
                  <Grid item xs={gridSpacing}>
                    <AgoraVideoPlayer
                      videoTrack={userMap[usr.userId].videoTrack}
                      key={userMap[usr.userId].uid}
                      style={{
                        height: '100%',
                        width: '100%',
                        position: 'relative'
                      }}
                    />
                  </Grid>
                )} */}
                  <p
                    key={index * 999}
                    className="my-2 "
                    onClick={() => onNameClick(usr)}
                  >
                    {usr.name} {user && user.userId === usr.userId && '(You)'}
                  </p>

                  {user?.presenter && (
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-user"></i>
                      </button>
                      <ul className="dropdown-menu">
                        {screenShareId === '' && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                shareScreen(true, usr.userId, usr.name);
                              }}
                            >
                              Share
                            </button>
                          </li>
                        )}
                        {screenShareId === '' && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                shareScreen(false, usr.userId, usr.name);
                              }}
                            >
                              Share Privately
                            </button>
                          </li>
                        )}
                        {screenShareId !== '' && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                stopSharing(usr.userId, usr.name);
                              }}
                            >
                              Stop Sharing
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            );
          })}
        </Stack>
    </Box>
  );
}
