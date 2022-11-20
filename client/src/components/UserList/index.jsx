import { useState, useEffect } from 'react';
import {
  config,
  useClient,
  useMicrophoneAndCameraTracks,
  channelName
} from './settings.js';
import { Grid } from '@material-ui/core';
import Video from './Video';
import Controls from './Controls';

export default function UserList(props) {
  const {
    user,
    users,
    setInCall,
    screenShareId,
    setScreenShareId,
    setShareUser,
    setScreenShareName,
    socket
  } = props;
  const [userMap, setUserMap] = useState({});
  const [start, setStart] = useState(false);
  // const client = useClient();
  // const { ready, tracks } = useMicrophoneAndCameraTracks();
  // const { ready, tracks } = null;

  // useEffect(() => {
  //   let init = async (name) => {
  //     client.on('user-published', async (user, mediaType) => {
  //       await client.subscribe(user, mediaType);
  //       if (mediaType === 'video') {
  //         let newUser = {};
  //         newUser[user.uid] = user;
  //         setUserMap((userMap) => ({
  //           ...userMap,
  //           ...newUser
  //         }));
  //       }
  //       if (mediaType === 'audio') {
  //         user.audioTrack.play();
  //       }
  //     });

  //     client.on('user-unpublished', (user, mediaType) => {
  //       if (mediaType === 'audio') {
  //         if (user.audioTrack) user.audioTrack.stop();
  //       }
  //       if (mediaType === 'video') {
  //         let userMapCopy = { ...userMap };
  //         delete userMapCopy[user.uid];

  //         setUserMap((userMap) => ({
  //           ...userMapCopy
  //         }));
  //       }
  //     });

  //     client.on('user-left', (user) => {
  //       let userMapCopy = { ...userMap };
  //       delete userMapCopy[user.uid];

  //       setUserMap((userMap) => ({
  //         ...userMapCopy
  //       }));
  //     });

  //     try {
  //       await client.join(config.appId, name, config.token, user.userId);
  //     } catch (error) {
  //       console.log('error');
  //     }

  //     if (tracks) await client.publish([tracks[0], tracks[1]]);
  //     setStart(true);
  //   };

  //   if (ready && tracks) {
  //     try {
  //       init(channelName);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // }, [channelName, client, ready, tracks]);

  // return (
  //   <Grid container direction="column" style={{ height: '100%' }}>
  //     <Grid item style={{ height: '5%' }}>
  //       {ready && tracks && (
  //         <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
  //       )}
  //     </Grid>
  //     <Grid item style={{ height: '95%' }}>
  //       {start && tracks && (
  //         <Video
  //           tracks={tracks}
  //           users={users}
  //           userMap={userMap}
  //           user={user}
  //           screenShareId={screenShareId}
  //           setScreenShareId={setScreenShareId}
  //           setShareId={setShareId}
  //           setShareName={setShareName}
  //           setScreenShareName={setScreenShareName}
  //           socket={socket}
  //         />
  //       )}
  //     </Grid>
  //   </Grid>
  // );

  return (
    <Grid container direction="column" style={{ height: '100%' }}>
      <Grid item style={{ height: '95%' }}>
        { (
          <Video
            tracks={null}
            users={users}
            userMap={userMap}
            user={user}
            screenShareId={screenShareId}
            setScreenShareId={setScreenShareId}
            setShareUser={setShareUser}
            setScreenShareName={setScreenShareName}
            socket={socket}
          />
        )}
      </Grid>
    </Grid>
  );
}
