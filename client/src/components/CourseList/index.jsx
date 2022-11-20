import { useState, useEffect } from 'react';
import { useSelector, connect } from 'react-redux';
import AddCourseForm from '../AddCourseForm';
import PropTypes from 'prop-types';
import {TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Box, Paper, Button} from '@mui/material'


const CourseList = () => {

    const [addclicked, setAddClicked] = useState(false);
    const user = useSelector((state) => state.auth.user)
    const [courses, setCourses] = useState([]);
    const [mounted, setMounted] = useState(true);
    const handleAddCourse = () => {
      setAddClicked(true);
    };

    useEffect(() => {

    if(mounted) {
      if(user.role === 'Instructor'){
      fetch(`/api/courses/${user._id}`)
      .then((res) => {
          if (res.ok){
            setMounted(false)
              return res.json();
          }
      })
      .then((jsonRes) => {
        setCourses(jsonRes)
      })
      .catch((err) => console.log(err));
    }
    else {
    fetch("/api/courses")
      .then((res) => {
          if (res.ok){
            setMounted(false)
              return res.json();
          }
      })
      .then((jsonRes) => {
        setCourses(jsonRes.filter(c => (user.courses).includes(c._id)))
      })
      .catch((err) => console.log(err));

    }
    }

    }, [courses]);

    if (addclicked) {
        return <AddCourseForm user={user} setAddClicked={setAddClicked}/> ;
      }
    else{

return (
  <Box>

  <TableContainer component={Paper} sx={{width: '50%', marginTop: `2rem`}}>
  <h1 className="text-primary fw-bold">My Courses</h1>
  <Table aria-label='simple table'>
    <TableHead>
      <TableRow>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Course Number</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Course Name</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Instructor</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        courses && courses.map((course) => (
          <TableRow key={course._id}>
            <TableCell>{course.coursenumber}</TableCell>
            <TableCell>{course.coursename}</TableCell>
            <TableCell>{course.instructorname}</TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
</TableContainer>
<Button variant='contained' onClick={() => handleAddCourse()} sx={{margin:'2rem', padding:'0.75rem'}}>Add Course</Button>
</Box>


);
  
    }
};

CourseList.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(CourseList);