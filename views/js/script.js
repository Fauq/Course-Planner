
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkCoursesForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        fetchCourses();
    });
});

function fetchCourses() {
    fetch('/users/dashboard/checkCourse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        displayCourses(data.courses);
    })
    .catch(error => console.error('Error fetching courses:', error));
}

function displayCourses(courses) {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = ''; // Clear existing courses
    coursesList.innerHTML = 'Your courses:';

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.textContent = `${course.course_code} - ${course.course_name}`;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeCourse(course.course_id, courseElement);


        courseElement.appendChild(removeButton);
        coursesList.appendChild(courseElement);
    });

}

function removeCourse (courseId, item) {
    fetch (`/users/dashboard/courses/${courseId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        item.remove();
    });
}

