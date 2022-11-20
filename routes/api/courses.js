const express = require('express');
const router = express.Router();

const Course = require('../../models/Course');

// @route    POST api/courses
// @desc     Add a Course
// @access   Private
router.post('/', async (req, res) => {
  
    try {
      const newCourse = new Course(req.body);
      const course = await newCourse.save();
      res.status(201).json(course._id);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/courses
// @desc    Get all courses
// @access  Private
router.get('/', async (req, res) => {
  try{
    const courses = await Course.find()
    res.status(200).json(courses)
  }
  catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
});

// @route    GET api/courses/instructorid
// @desc     Get all courses of an instructor
// @access   Private
router.get('/:instructorid', async (req, res) => {
  try {

    const instructorId = req.params.instructorid;
    const query = { instructorid: { $eq: instructorId } };
    const courses = await Course.find(query);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;