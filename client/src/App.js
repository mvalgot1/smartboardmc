import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import CourseList from './components/CourseList';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import NotFound from './components/layout/NotFound';
import PrivateRoute from './components/routing/PrivateRoute';
import { LOGOUT } from './actions/types';
import Forms from './components/Forms';
import RoomPage from './pages/RoomPage';

import io from 'socket.io-client';

// Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

const server = 'http://localhost:8080';
const connectionOptions = {
  'force new connection': true,
  reconnectionAttempts: 'Infinity',
  timeout: 10000,
  transports: ['websocket']
};

const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // check for token in LS when app first runs
    if (localStorage.token) {
      // if there is a token set axios headers for all requests
      setAuthToken(localStorage.token);
    }
    // try to fetch a user, if no token or invalid token we
    // will get a 401 response from our API
    store.dispatch(loadUser());

    // log user out from all tabs if they log out in one tab
    window.addEventListener('storage', () => {
      if (!localStorage.token) store.dispatch({ type: LOGOUT });
    });
  }, []);

  useEffect(() => {
    socket.on('allUsers', (data) => {
      setUsers(data);
    });
  }, []);

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

  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Alert />
        <div>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <CourseList/>
                </PrivateRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <PrivateRoute>
                  <Forms uuid={uuid} socket={socket} setUser={setUser} />
                </PrivateRoute>
              }
            />
            <Route
              path="/:roomId"
              element={
                <PrivateRoute>
                  <RoomPage user={user} socket={socket} users={users} />
                </PrivateRoute>
              }
            />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
