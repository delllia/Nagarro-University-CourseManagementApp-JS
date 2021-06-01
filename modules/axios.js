export { getDbStudents, getDbCourses, sendStudentData };

function getDbStudents() {
	return axios
		.get("http://localhost:3000/students")
		.then((response) => response.data)
		.catch((error) => console.log(error));
}

function sendStudentData(st) {
	axios
		.post("http://localhost:3000/students", st)
		.then((response) => console.log("axios post response is", response))
		.catch((error) => console.log(error));
}

function getDbCourses() {
	return axios
		.get("http://localhost:3000/courses")
		.then((response) => response.data)
		.catch((error) => console.log(error));
}
