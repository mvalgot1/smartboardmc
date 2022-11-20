const express = require('express');
const router = express.Router();

const Session = require('../../models/Session');

// @route    GET api/sessions
// @desc     Get all sessions
// @access   Private
router.get('/', async (req, res) => {
    try {
      const sessions = await Session.find();
      res.json(sessions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route    GET api/sessions/sessionid
// @desc     Get a session
// @access   Private
router.get('/:sessionid', async (req, res) => {
  try {
    const sessionId = req.params.sessionid
    const session = await Session.findById(sessionId); 
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PATCH api/sessions/sessionid
// @desc     Update a session
// @access   Private
router.patch('/:sessionid', async (req, res) => {
  try {
    const sessionId = req.params.sessionid
    const updatedSession = await Session.findByIdAndUpdate(sessionId, req.body);
    res.status(201).json(updatedSession);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/sessions
// @desc     Create a session
// @access   Private
router.post('/', async (req, res) => {
  
      try {
        const newSession = new Session(req.body);
        const session = await newSession.save();
        res.status(201).json(session._id);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

  module.exports = router;