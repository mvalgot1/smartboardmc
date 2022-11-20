import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../utils/api';
import { useSelector } from 'react-redux';
import {TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button} from '@mui/material'

const JoinRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState("");
  const [mounted, setMounted] = useState(true)
  const user = useSelector((state) => state.auth.user);
  const [sessions, setSessions] = useState([
    {
        hostname: "",
        sessionname: "",
    }
]);

  useEffect(() => {
      if(mounted){
      fetch("/api/sessions")
      .then((res) => {
          if (res.ok){
              setMounted(false);
              return res.json();
          }
      })
      .then((jsonRes) => setSessions(jsonRes.filter(s => {
        const date = new Date();
        return (s.courseid == null || user.courses.includes(s.courseid)) && new Date(date.setMinutes(date.getMinutes() - 5)) <= new Date(s.startdatetime) && new Date(s.startdatetime) <=  new Date(date.setMinutes(date.getMinutes() + 15)) && s.isstarted === true && s.isended === false 
      })))
      .catch((err) => console.log(err));
    }

}, [sessions]);

  const navigate = useNavigate();

  const handleRoomJoin = (session) => {
    setRoomId(session._id);

    const roomData = {
      name: user.name,
      roomId: session._id,
      userId:  user._id,
      host: false,
      presenter: false,
      isGroup: false,
      groupMembers: [],
      hostId: session.hostid
    };
    setUser(roomData);
    navigate(`/${session._id}`);
    socket.emit("userJoined", roomData);
  };

  return (

<TableContainer component={Paper}>
  <Table aria-label='simple table'>
    <TableHead>
      <TableRow>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Host</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Meeting Name</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Course</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Start Time</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        sessions.map((session) => (
          <TableRow key={session._id}>
            <TableCell>{session.hostname}</TableCell>
            <TableCell>{session.sessionname}</TableCell>
            <TableCell>{session.coursenumber}</TableCell>
            <TableCell>{ (new Date(session.startdatetime)).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' })}</TableCell>
            <TableCell> <Button variant="contained" onClick={() => handleRoomJoin(session)}> Join </Button> </TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
</TableContainer>
        
  );
};

export default JoinRoomForm;
