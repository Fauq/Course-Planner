const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const PORT = process.env.PORT || 4000;
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const diningRoutes = require("./routes/dining");
const dashboardRoutes = require("./routes/dashboard");

const initializePassport = require('./passportConfig');

initializePassport(passport);

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.session());
app.use(passport.initialize());

app.use(flash());

app.engine('ejs', require('ejs').__express);
app.get("/", (req, res) => {
   res.render('index'); 
});

app.get('/users/register', checkAuthenticated, (req, res)=>{
    res.render("register");
});

app.get('/users/login', checkAuthenticated, (req, res)=>{
    res.render("login");
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res)=>{
    const selectedMajor = req.query.selectedMajor || '';
    res.render('dashboard', { user: req.user.name, selectedMajor });
});

app.get('/users/logout', function(req, res, next) {
    req.logout(function(err) {
        if(err){
            return next(err);
        }
        res.render("index", { message: "You have logged out successfully" });
    });
});

app.post('/users/register', async (req, res)=>{
    let {name, email, password, password2} = req.body;
    console.log({
        name, email, password, password2
    });

    let errors = [];
    

    if(!name || !email || !password || !password2){
        errors.push({message: "Please enter all fields"});
    }

    if(password.length < 6){
        errors.push({message: "Password should be at least 6 characters"});
    }

    if(password != password2){
        errors.push({message: "Passwords do not match"});
    }

    if(errors.length > 0){
        res.render('register', {errors});
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            'SELECT * FROM users WHERE email = $1', [email], (err, results) => {
                if(err){
                    throw err;
                }
                console.log(results.rows);

                if(results.rows.length > 0){
                    errors.push({message: "Email already registered"});
                    res.render('register', {errors});
                } else {
                    pool.query(
                        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password', [name, email, hashedPassword], (err, results) => {
                            if(err){
                                throw err;
                            }
                            
                            console.log(results.rows);
                            req.flash('success_msg', "You are now registered. Please log in");
                            res.redirect('/users/login');
                        }
                    )
                }
            }
        )
    }
});

app.post('/users/login', passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
}));

// Updating user dining hall  


// async function getCourseIdFromCode(courseCode) {
//     try {
//         // Query the database for the course with the matching code
//         const result = await pool.query('SELECT id FROM courses WHERE code = $1', [courseCode]);
//         if (result.rows.length > 0) {
//             // If a matching course is found, return its ID
//             return result.rows[0].id;
//         } else {
//             // If no matching course is found, return null or handle as needed
//             return null;
//         }
//     } catch (err) {
//         console.error('Error querying the database:', err);
//         throw err;
//     }
// }

// // async function getCourseNameFromCode(courseCode) {
// //     try {
// //         // Query the database for the course with the matching code
// //         const result = await pool.query('SELECT name FROM courses WHERE code = $1', [courseCode]);
// //         if (result.rows.length > 0) {
// //             // If a matching course is found, return its name
// //             return result.rows[0].name;
// //         } else {
// //             // If no matching course is found, return null or handle as needed
// //             return null;
// //         }
// //     } catch (err) {
// //         console.error('Error querying the database:', err);
// //         throw err;
// //     }
// // }

// // async function getNumberOfCourses(studentId) {
//     try {
//         // Query the database for the number of courses the student is enrolled in
//         const result = await pool.query('SELECT COUNT(*) FROM student_courses WHERE student_id = $1', [studentId]);
//         if (result.rows.length > 0) {
//             // If a matching course is found, return its ID
//             return result.rows[0].count;
//         } else {
//             // If no matching course is found, return null or handle as needed
//             return null;
//         }
//     } catch (err) {
//         console.error('Error querying the database:', err);
//         throw err;
//     }
// }
// Updating user courses
// app.post('/users/dashboard/addCourse', checkNotAuthenticated, async (req, res) => {
//     const courseId = await getCourseIdFromCode(req.body.courseId);
//     const studentId = req.user.id;  // Replace with the actual student ID, possibly from session/auth
//     const courseCode = req.body.courseId; 
//     const courseName = await getCourseNameFromCode(req.body.courseId);

    
//     try {
//         // Log variables to ensure proper types
//         console.log('Student ID:', studentId, 'Type:', typeof studentId);
//         console.log('Course ID:', courseId, 'Type:', typeof courseId);

//         // Ensure type consistency by converting to integer if necessary
//         const parsedCourseId = parseInt(courseId);
//         const parsedStudentId = parseInt(studentId);
        
  
//         if (isNaN(parsedStudentId) || isNaN(parsedCourseId)) {
//             return res.status(400).send('Invalid ID format');
//         }

//         // Check if the course already exists in the student_courses table
//         const courseExists = await pool.query('SELECT * FROM student_courses WHERE student_id = $1 AND course_id = $2', [parsedStudentId, parsedCourseId]);
        

//         if (courseExists.rows.length > 0) {
//             return res.status(400).send('Course already added');
//         } else {
//             // Insert new course for the student
//             await pool.query('INSERT INTO student_courses (student_id, course_id, course_code, course_name) VALUES ($1, $2, $3, $4)', [parsedStudentId, parsedCourseId, courseCode, courseName]);
//         }
  
//         res.redirect('/users/dashboard');
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).send('Server error');
//     }
// });

// app.post('/users/dashboard/checkCourse', checkNotAuthenticated, async (req, res) => {
//     student_id = req.user.id; // Replace with the actual student ID, possibly from session/auth
//     numCourses = getNumberOfCourses(student_id);

//     try {
//         if (numCourses < 1) { 
//             return res.status(400).send('No courses in database');
//         }

//         const result = await pool.query('SELECT course_code, course_name, course_id FROM student_courses WHERE student_id = $1',
//             [student_id]);

        
//         res.json({ courses: result.rows });
//         console.log({ courses: result.rows });
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).send('Server error');
//     }
// });

// app.delete('/users/dashboard/courses/:courseId', checkNotAuthenticated, async (req, res) => {
//     const courseId = req.params.courseId;
//     const studentId = req.user.id;  // Replace with the actual student ID, possibly from session/auth
//     console.log('Course ID:', courseId);

//     try {
//         const result = await pool.query('DELETE FROM student_courses WHERE student_id = $1 AND course_id = $2 RETURNING *',
//             [studentId, courseId]);

//         if (result.rows.length === 0) {
//             return res.status(404).send('Course not found');
//         } 

//         res.json({ message: 'Course deleted' });
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).send('Server error');
//     }

// });

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

app.use('/dining', diningRoutes);
app.use('/users', dashboardRoutes);

app.listen(PORT, ()=> {
    console.log('Server running on port ${PORT}');
});


