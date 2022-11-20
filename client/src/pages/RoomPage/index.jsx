import './index.css';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WhiteBoard from '../../components/Whiteboard';
import ShareBoard from '../../components/ShareBoard';
import ShareBoardNew from '../../components/ShareBoardNew';
import GroupBoard from '../../components/GroupBoard';
import UserList from '../../components/UserList';
import CreateGroupModal from '../../components/CreateGroupModal';
import { Stack } from '@mui/material';

import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const RoomPage = ({ user, socket, users }) => {
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('black');
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const sharedCanvasRef = useRef(null);
  const sharedCtxRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [sharedElements, setSharedElements] = useState([]);
  const [groupElements, setGroupElements] = useState([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [isBoardCleared, setIsBoardCleared] = useState(false);
  const [shareUser, setShareUser] = useState(user);
  const [shareId, setShareId] = useState(null);
  const [shareName, setShareName] = useState('Instructor');
  const [openModal, setOpenModal] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [isShareActive, setShareActive] = useState(
    user?.presenter ? false : true
  );
  const [isGroupActive, setGroupActive] = useState(false);
  const [screenShareId, setScreenShareId] = useState('');
  const [screenShareName, setScreenShareName] = useState('');
  const [shareBoardName, setShareBoardName] = useState('');
  const [inCall, setInCall] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('joinGroup', (data) => {
      if (data.members.includes(user.userId)) {
        alert("You are added to group '" + data.groupName + "'.");
        setGroupId(data.groupId);
        user.groupId = data.groupId;
      }
    });
  }, []);

  // useEffect(() => {
  //   if (shareId != null && shareId === groupId) {
  //     setGroupActive(true);
  //     setShareActive(false);
  //   } else if (shareId != null && shareId === user.userId) {
  //     setGroupActive(false);
  //     setShareActive(false);
  //   } else {
  //     setGroupActive(false);
  //     setShareActive(true);
  //   }
  // }, [shareId]);

  useEffect(() => {
    socket.on('meetingEnded', (data) => {
      if (user.host) {
        socket.emit('closeMeeting', data);
      } else {
        console.log('Meeting: ' + data + ' Ended');
        alert('Meeting Ended');
        navigate(`/forms`);
      }
    });
  }, []);

  const handleExitMeeting = () => {
    if (user.host) {
      fetch(`/api/sessions/${user.roomId}`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
        })
        .then((jsonRes) => {
          jsonRes.isended = true;
          fetch(`/api/sessions/${user.roomId}`, {
            method: 'PATCH',
            body: JSON.stringify(jsonRes),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        })
        .catch((err) => console.log(err));
      socket.emit('endMeeting', user);
      alert('Meeting Ended');
      navigate(`/forms`);
    } else {
      socket.emit('exitMeeting', user);
      alert('Exited from meeting');
      navigate(`/forms`);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillRect = 'white';
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
    setIsBoardCleared(true)
    socket.emit('whiteboardData', {
      imgurl: null,
      uid: shareUser.userId,
      roomId: user.roomId
    });
  };

  const showWhiteBoard = () => {
    const shareWhiteBoard =
      (shareUser.userId === null && user?.presenter) || user.userId == shareUser.userId;
    return shareWhiteBoard;
  };

  const sendGroupCreationEvent = (usersAdded, name) => {
    setOpenModal(false);
    const newUserId = uuid();
    const roomData = {
      name: name,
      roomId: user.roomId,
      userId: newUserId,
      host: false,
      presenter: false,
      isGroup: false,
      groupMembers: usersAdded,
      hostId: user.userId
    };
    socket.emit('userJoined', roomData);
    const data = {
      members: usersAdded,
      groupId: newUserId,
      roomId: user.roomId,
      groupName: name
    };
    socket.emit('createGroup', data);
  };

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    );
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  // const onNameClick = (userId, userName) => {
  //   setShareId(userId);
  //   if (userName === user.name) {
  //     setShareName('Me');
  //   } else {
  //     setShareName(userName);
  //   }

  //   socket.emit('requestBoard', {
  //     id: userId,
  //     uid: user.userId,
  //     roomId: user.roomId
  //   });
  // };

  const canOpenModal = () => {
    return user?.presenter && openModal;
  };

  return (
    <Stack direction="row" spacing={30} >
      {/* <button
        type="button"
        className="btn btn-dark"
        style={{
          display: 'block',
          position: 'absolute',
          top: '10%',
          left: '5%',
          height: '40px',
          width: '120px'
        }}
        onClick={() => setOpenedUserTab(true)}
      >
        Participants
      </button>
      {openedUserTab && ( */}
        <div
          className="position-fixed top-0 h-100 text-white bg-dark"
          style={{ width: '250px', left: '0%', zIndex: 999 }}
        >
          {/* <button
            type="button"
            onClick={() => setOpenedUserTab(false)}
            className="btn btn-light btn-block w-100 "
          >
            Close
          </button> */}
          <div className="w-100 pt-5">
            {
              <UserList
                user={user}
                users={users}
                setInCall={setInCall}
                screenShareId={screenShareId}
                setScreenShareId={setScreenShareId}
                setShareUser={setShareUser}
                setScreenShareName={setScreenShareName}
                socket={socket}
              />
            }
          </div>
        </div>
      {/* )} */}
      <div>
      { shareUser.userId === 'shareboard' ?
      <h4 className="text-center py-4"> {shareUser.name} : {shareBoardName} </h4> :
      <h4 className="text-center py-4"> {shareUser.name} : </h4> }
      <div className="col-mid-10 mx-auto px-5 d-flex align-items-center justify-content-center">
        {(shareUser.userId !== 'shareboard') && (
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              onChange={(e) => setTool(e.target.value)}
              row={true}
            >
              <FormControlLabel
                value="pencil"
                control={<Radio />}
                label="Pencil"
              />
              <FormControlLabel value="line" control={<Radio />} label="Line" />
            </RadioGroup>
          </FormControl>
        )}

        {(shareUser.userId !== 'shareboard') && (
          <div className="col-md-5">
            <div className="d-flex align-items-center justify-content-center">
              <label htmlFor="color">Select Color: </label>
              <input
                type="color"
                id="color"
                value="{color}"
                style={{ width: '100px' }}
                className="mt-1 ms-3"
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
        )}
        {(shareUser.userId !== 'shareboard') && (
          <div className="col-md-2">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Board
            </button>
          </div>
        )}

        {(shareUser.userId !== 'shareboard') && (
          <div className="col-md-2">
            <button className="btn btn-danger" onClick={handleExitMeeting}>
              {user.host ? 'End Meeting' : 'Exit Meeting'}
            </button>
          </div>
        )}

        {user?.presenter && users.length > 1 && (
          <div className="col-md-2">
            <button
              className="btn btn-primary"
              onClick={() => setOpenModal(true)}
            >
              Create Group
            </button>
          </div>
        )}
      </div>
      {  shareUser.userId === 'shareboard' ? (
        <ShareBoardNew
         user={user}
         socket={socket}
         setShareBoardName={setShareBoardName}
        />
      ) :
      showWhiteBoard() ? (
        <WhiteBoard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
          screenShareId={screenShareId}
          screenShareName={screenShareName}
          isBoardCleared={isBoardCleared}
          setIsBoardCleared={setIsBoardCleared}
        />
      ) 
      // : shareUser.userId != null && shareUser.userId === groupId ? (
      //   <GroupBoard
      //     canvasRef={sharedCanvasRef}
      //     ctxRef={sharedCtxRef}
      //     elements={groupElements}
      //     setElements={setGroupElements}
      //     tool={tool}
      //     color={color}
      //     user={user}
      //     socket={socket}
      //     shareName={shareUser.name}
      //   />
      // ) 
      : (
        <ShareBoard
          canvasRef={sharedCanvasRef}
          ctxRef={sharedCtxRef}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
          shareUser={shareUser}
        />
      ) 
    }
      {canOpenModal() && (
        <CreateGroupModal
          sendGroupCreationEvent={sendGroupCreationEvent}
          closeModal={closeModal}
          users={users}
          user={user}
        />
      )}
      </div>
    </Stack>
  );
};

export default RoomPage;
