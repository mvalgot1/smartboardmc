const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  coursenumber: {
    type: String,
    required: true
  },
  coursename: {
    type: String,
    required: true
  },
  instructorid: {
    type: String,
    required: true
  },
  instructorname: {
    type: String,
    required: true
  }
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;