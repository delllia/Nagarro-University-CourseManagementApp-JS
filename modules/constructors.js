export { typeCheck, Course, Student };

let coursesList = [];
let studentsList = [];

const typeCheck = {
	hasAllProperties: (props) => {
		for (let i = 0; i < props.length; i++) {
			if (!props[i]) return false;
		}
		return true;
	},
	isNumber: (val) => typeof val === "number" && !Number.isNaN(val),
	isString: (val) => typeof val === "string" && val !== "",
	isAdditionalString: (val) =>
		(typeof val === "string" && val !== "") || val === null,
	isAnArray: (val) => Array.isArray(val),
	isIdUnique: (val) => coursesList.every((item) => item.id !== val),
	isidUnique: (val) => studentsList.every((item) => item.id !== val),
};

function Course(id, name, assignedTeacher, studentList) {
	try {
		if (!typeCheck.hasAllProperties([id, name, assignedTeacher, studentList]))
			throw new Error("Required property is missing");

		if (
			!typeCheck.isNumber(id) ||
			!typeCheck.isString(name) ||
			!typeCheck.isString(assignedTeacher) ||
			!typeCheck.isAnArray(studentList)
		)
			throw new Error("Invalid property type");

		if (!typeCheck.isIdUnique(id))
			throw new Error(`Course with id ${id} already exists`);
	} catch (err) {
		console.log("Ops! " + err);
		return;
	}

	this.id = id;
	this.name = name;
	this.assignedTeacher = assignedTeacher;
	this.studentList = studentList;
	let course = { id, name, assignedTeacher, studentList };
	coursesList.push(course);
	console.log("Course was successfully created");
}

function Student(
	id,
	firstName,
	lastName,
	gender,
	address = null,
	hobbies = null,
	grades = {}
) {
	try {
		if (!typeCheck.hasAllProperties([id, firstName, lastName, gender]))
			throw new ValidationError("Required property is missing");

		if (
			!typeCheck.isNumber(id) ||
			!typeCheck.isString(firstName) ||
			!typeCheck.isString(lastName) ||
			!typeCheck.isString(gender)
		)
			throw new Error("Invalid property type");

		// if (
		// 	!typeCheck.isAdditionalString(address) ||
		// 	!typeCheck.isAdditionalString(hobbies)
		// )
		// 	throw new Error("Invalid additional property type");

		if (!typeCheck.isidUnique(id))
			throw new Error(`Student with id ${id} already exists`);
	} catch (err) {
		console.log("Ops! " + err);
		return;
	}

	this.id = id;
	this.firstName = firstName;
	this.lastName = lastName;
	this.gender = gender;
	this.address = address;
	this.hobbies = hobbies;
	this.grades = grades;
	let student = {
		id,
		firstName,
		lastName,
		gender,
		address,
		hobbies,
		grades,
	};
	studentsList.push(student);
	console.log("Student was successfully created");
}

// class ValidationError extends Error {
// 	constructor(message) {
// 		super(message);
// 		this.name = "ValidationError";
// 		this.message = "Required property is missing";
// 	}
// }

Course.prototype.printStudentList = function () {
	console.log(this.studentList);
};

Course.prototype.addStudent = function (student) {
	if (
		!this.studentList.every((item) => {
			return item.id !== student.id;
		})
	)
		throw new Error(`Student with id ${student.id} already exists`);

	this.studentList.push(student);

	let courseGrade = this.name + "Grade";
	student.grades[courseGrade] = null;

	console.log(
		`Student with id ${student.id} was successfully added to this course with ${courseGrade}`
	);
};

Course.prototype.deleteStudent = function (student) {
	if (
		this.studentList.every((item) => {
			return item.id !== student.id;
		})
	)
		throw new Error(
			"Student id is invalid resulting in failing to delete the specified student from this course"
		);

	this.studentList = this.studentList.filter((item) => {
		return item.id !== student.id;
	});
	console.log(`Student with id ${student.id} was successfully deleted`);

	delete student.grades[this.name + "Grade"];
	this.averageGrade();
};

Student.prototype.addGrade = function (courseGrade, grade) {
	if (!typeCheck.isNumber(grade) || !typeCheck.isString(courseGrade))
		throw new Error("Invalid property type");
	if (!(1 <= parseInt(grade) <= 10))
		throw new Error("Grade must be a floating number between 1 and 10");
	this.grades[courseGrade] = grade;
	console.log(
		`Grade ${grade} was successfully added to ${this.firstName} ${this.lastName} student at ${courseGrade}`
	);
};

Course.prototype.averageGrade = function () {
	let courseGrades = [];
	this.studentList.forEach((student) => {
		if (student.grades[this.name + "Grade"] !== null) {
			courseGrades.push(student.grades[this.name + "Grade"]);
		}
	});
	console.log(courseGrades);
	let averageGrade =
		courseGrades.reduce((a, b) => a + b, 0) / courseGrades.length;
	console.log(`${this.name} grades average is ${averageGrade}`);
	return averageGrade;
};

Course.prototype.sortStudents = function () {
	let grade = this.name + "Grade";
	let students = this.studentList;

	students.sort((a, b) => {
		return b.grades[grade] - a.grades[grade];
	});

	console.log(students);
};

//given a course, return the students with the course grade bigger than the average course grade
//given an array of students, return the most enjoyed course
//(meaning the course which has the highest occurrence between the given students)
//given an array of courses, return the students which attend all givencourses

function studentsOverAverage(course) {
	let av = course.averageGrade();
	let cg = course.name + "Grade";
	console.log(av);
	let filteredStudents = course.studentList.filter((student) => {
		return student.grades[cg] > av;
	});
	console.log(
		`Students over average for ${course.name} are: `,
		filteredStudents.map((st) => st.firstName)
	);
}

function mostEnjoyedCourse(students) {
	let arrOfCourses = [];
	students.forEach((student) => {
		for (const key in student.grades) {
			arrOfCourses.push(key);
		}
	});
	console.log(arrOfCourses);

	let compare = 0;
	let mostEnjoyed = "";
	let accObj = arrOfCourses.reduce((acc, val) => {
		val in acc ? acc[val]++ : (acc[val] = 1);
		if (acc[val] > compare) {
			compare = acc[val];
			mostEnjoyed = val;
		}
		return acc;
	}, {});
	console.log(compare, mostEnjoyed);
	console.log(accObj);
	let resultSet = new Set(
		arrOfCourses.filter((course) => accObj[course] === compare)
	);
	let resultArray = Array.from(resultSet);
	console.log("Most enjoyed course is:", resultArray);
}

function mostActiveStudents(courses) {
	let activeStudents = [];
	courses.forEach((course) => {
		course.studentList.filter((student) => activeStudents.push(student.id));
	});
	console.log(activeStudents);

	let compare = 0;
	let mostActive = "";
	let activeStudentsObj = activeStudents.reduce((acc, val) => {
		val in acc ? acc[val]++ : (acc[val] = 1);
		if (acc[val] > compare) {
			compare = acc[val];
			mostActive = val;
		}
		return acc;
	}, {});
	console.log(activeStudentsObj);
	console.log(compare, mostActive);
	let resultSet = new Set(
		activeStudents.filter((id) => activeStudentsObj[id] === compare)
	);
	let resultArray = Array.from(resultSet);
	console.log("Most active students are students with ID's:", resultArray);
}

// input/output data:

var historyCourse = new Course(1, "history", "Victoria Cobbett", []); //should output 'Course was successfully created'
var frenchCourse = new Course("3", "french", "Josselin Bourseiller", []); //should output 'Invalid property type'
var englishCourse = new Course(2, "english", "Andrea Barrett", []); //should output 'Course was successfully created'
var mathematicsCourse = new Course(2, "mathematics", "Jack  Connor", []); //should output 'Course with id 2 already exists'
var physicsCourse = new Course(10); //should output 'Required property is missing'
var martinStudent = new Student(1, "Martin", "Lawrence", "M"); //should output 'Student was successfully created'
var kellyStudent = new Student(
	"3",
	"Freddy",
	"Kelly",
	"M",
	"3497 James Avenue"
); //should output 'Invalid required property type'
var kellyStudent = new Student(2, "Freddy", "Kelly", "M", "3497 James Avenue"); //should output 'Student was successfully created'
var maxStudent = new Student(
	2,
	"Max",
	"Austin",
	"M",
	"4026  Lee Avenue",
	"sports"
); //should output 'Student with id 2 already exists'
var maxStudent = new Student(
	3,
	"Max",
	"Austin",
	"M",
	"4026  Lee Avenue",
	"sports"
); //should output 'Student was successfully created'
var aliyaCollins = new Student(
	4,
	"Aliya",
	"Collins",
	"F",
	"353  Oliverio Drive",
	19
); //should output 'Invalid additional property type'
var aliyaCollins = new Student(
	4,
	"Aliya",
	"Collins",
	"F",
	"353  Oliverio Drive",
	"cooking, reading"
); //should output 'Student was successfully created'
var norahCollins = new Student(5, "Norah"); //should output 'Required property is missing'
console.log(martinStudent.hobbies); //should output null
historyCourse.addStudent(martinStudent); //should output 'Student with id 1 was successfully added to this course'
historyCourse.addStudent(kellyStudent); //should output 'Student with id 2 was successfully added to this course'
englishCourse.addStudent(martinStudent); //should output 'Student with id 1 was successfully added to this course'

martinStudent.addGrade("historyGrade", 8);
// should output 'Grade 8 was successfully added to Martin Lawrence student at historyGrade'
kellyStudent.addGrade("historyGrade", 7);
// should output 'Grade 7 was successfully added to Freddy Kelly student at historyGrade'

historyCourse.sortStudents();
// should sort studentlist in descending grades order

studentsOverAverage(historyCourse);
// should output 'history grades average is 7.5'

const students = [martinStudent, martinStudent, kellyStudent];
const courses = [historyCourse, englishCourse];

mostEnjoyedCourse(students);
// should output 'Most enjoyed course is: ["historyGrade"]'

mostActiveStudents(courses);
// should output 'Most active students are students with ID's: [1]'
