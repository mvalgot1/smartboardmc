import { useState, useEffect } from "react";
import { TextField, Button, Box, Paper, Stack, TableContainer, Table, TableHead, TableBody, TableRow, TableCell} from "@mui/material";
import { loadUser } from '../../actions/auth';

const AddCourseForm = ({ user, setAddClicked }) => {
    const [coursenumber, setCourseNumber] = useState("");
    const [coursename, setCourseName] = useState("");
    const [courses, setCourses] = useState([]);
    const [mounted, setMounted] = useState(true);

    useEffect(() => {
      if(mounted) {
      fetch("/api/courses")
      .then((res) => {
          if (res.ok){
            setMounted(false)
              return res.json();
          }
      })
      .then((jsonRes) => setCourses(jsonRes))
      .catch((err) => console.log(err));
    }
    }, [courses]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const courseData = {
            coursenumber: coursenumber,
            coursename: coursename,
            instructorid: user._id,
            instructorname: user.name,
        };

        fetch("/api/courses", {method: "POST", body: JSON.stringify(courseData), headers: {
            'Content-Type': 'application/json'} })
            .then((res) => {
              if (res.ok){
                  return res.json();
              }
        })
        .then((courseid) => {
            fetch(`/api/users/${user._id}`)
            .then((res) => {
              if (res.ok) {
                return res.json();
              }
            })
            .then((userData) => {
                var prevcourses = userData.courses
                prevcourses.push(courseid)
                userData.courses = prevcourses
                fetch(`/api/users/${user._id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(userData),
                    headers: {
                      'Content-Type': 'application/json'
                    }
                });
            })
        })
        alert("Course added successfully");
        loadUser();
        setAddClicked(false);
        window.location.reload(false);
    };

    const registerCourse = (courseid) => {

        fetch(`/api/users/${user._id}`)
            .then((res) => {
              if (res.ok) {
                return res.json();
              }
            })
            .then((userData) => {
                var prevcourses = userData.courses
                prevcourses.push(courseid)
                userData.courses = prevcourses
                fetch(`/api/users/${user._id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(userData),
                    headers: {
                      'Content-Type': 'application/json'
                    }
                });
            })
        alert("Course registered successfully");
        setAddClicked(false);
        window.location.reload(false);
    };

    return (
        <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: `3rem`
          }}>
        {user.role === 'Instructor' ? 
        <form  style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
              <h1 className="text-primary fw-bold" >Add Course</h1>
              
            <TextField
                label="Course Number"
                variant="filled"
                value={coursenumber}
                sx={{margin: '1rem', width: `24rem`}}
                required
                onChange={e => setCourseNumber(e.target.value)}
            />
            <TextField
                label="Course Name"
                variant="filled"
                value={coursename}
                sx={{margin: `1rem`, width: `24rem`}}
                required
                onChange={e => setCourseName(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" onClick={handleSubmit}> ADD </Button>
            <Button variant="contained" onClick={() => setAddClicked(false)}> MY COURSES </Button>
            </Stack>
        </form>
        : 
        <TableContainer component={Paper} sx={{width: '50%'}}>
        <Stack direction="row" spacing={8}>
        <h1 className="text-primary fw-bold">Available Courses</h1>
        <Button variant="contained" onClick={() => setAddClicked(false)}> MY COURSES </Button>
        </Stack>
        <Table aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Course Number</TableCell>
              <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Course Name</TableCell>
              <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Instructor</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              courses && courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.coursenumber}</TableCell>
                  <TableCell>{course.coursename}</TableCell>
                  <TableCell>{course.instructorname}</TableCell>
                  <TableCell> <Button variant='contained' disabled={user.courses.includes(course._id)} onClick={() => registerCourse(course._id)}> Register </Button> </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      }
        </Box> 
    );

};

export default AddCourseForm;