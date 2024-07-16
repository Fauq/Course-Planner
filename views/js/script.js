
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

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedHall = urlParams.get('selectedHall');
    const selectedHallName = {
        'NORTH': 'North Quad',
        'SOUTH': 'South Quad',
        'BURSLEY': 'Bursley Hall'
        // Add more mappings for other dining halls
    }[selectedHall];

    if (selectedHallName) {
        document.getElementById('selectedHall').innerText = `Selected Dining Hall: ${selectedHallName}`;
        fetch(`/dining-hall/${selectedHall}`)
            .then(response => response.json())
            .then(data => {
                const diningHallMenu = document.getElementById('diningHallMenu');
                diningHallMenu.innerHTML = '';
                data.menu_items.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.innerText = `${item.name} - ${item.calories} calories`;
                    diningHallMenu.appendChild(listItem);
                });
            })
            .catch(error => {
                console.error('Error fetching dining hall data:', error);
            });
    } else {
        document.getElementById('selectedHall').innerText = 'No dining hall selected';
    }
});
