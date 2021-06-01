import {
	getDbStudents,
	getDbCourses,
	sendStudentData,
} from "./modules/axios.js";

import { typeCheck, Student } from "./modules/constructors.js";

//--getting html elements and setting event listeners--
const teacherSnameDiv = document.querySelector("#teacherSdiv");
const table = document.querySelector("#selectedCourseStudents");
table.addEventListener("click", deleteStudentFromCourse, true);

const list = document.querySelector("ul");
const createStButton = document.querySelector("#createStudentButton");
// createStButton.addEventListener("click", showForm);
const form = document.querySelector("#studentForm");
// const closeBtn = document.querySelector("#closeForm");
// closeBtn.addEventListener("click", hideForm);
const createBtn = document.querySelector("#createFormStudent");
createBtn.addEventListener("click", createStudent);
const studentSelect = document.querySelector("#studentSelect");

function getEventTarget(event) {
	event = event || window.event;
	return event.target || event.srcElement;
}

//--get courses data from db for the 'ul' html element--

getDbCourses()
	.then((data) => {
		data
			.map((course) => course.name)
			.forEach((name) => {
				const listItem = document.createElement("li");
				let txt = document.createTextNode(name);
				listItem.append(txt);
				listItem.setAttribute("class", "grey");
				list.append(listItem);
				console.log("listItem is", listItem);

				listItem.addEventListener("click", addStudentsToTable);
			});
	})
	.catch((error) => console.log(error));

//--get students data from db for the 'select' html element--

getDbStudents()
	.then((dbStudents) => {
		console.log("dbStudents: ", dbStudents);
		dbStudents.forEach((item) => {
			let ops = document.createElement("option");
			ops.innerHTML =
				item.id +
				"," +
				item.firstName +
				"," +
				item.lastName +
				"," +
				item.gender;
			studentSelect.append(ops);
		});
	})
	.catch((error) => console.log(error));

//--UI actions functions--

function addStudentsToTable() {
	let blueLi = document.querySelectorAll(".blue")[0];
	if (this.className == "grey") {
		if (blueLi) blueLi.className = "grey";
		this.className = "blue";
	}
	let trs = document.querySelectorAll("tr");
	for (let i = 1; i < trs.length; i++) {
		trs[i].remove();
	}
	let txt = this.innerHTML;

	getDbCourses()
		.then((data) => {
			let activeCourse = data.find((course) => course.name === txt);
			teacherSnameDiv.innerHTML = "Teacher: " + activeCourse.assignedTeacher;
			let courseStudents = activeCourse.studentList;

			courseStudents.forEach((st) => {
				let newRow = table.insertRow(1);
				const keys = Object.keys(st);
				let rowCellsLen = table.rows[0].cells.length;
				for (let i = 0; i < rowCellsLen - 1; i++) {
					st[keys[i]] !== "null"
						? (newRow.insertCell(i).innerHTML = st[keys[i]])
						: (newRow.insertCell(i).innerHTML = "-");
				}
				let deleteStudentButton = newRow.insertCell(6);
				deleteStudentButton.setAttribute("class", "deleteStBtn");
				deleteStudentButton.innerHTML = `<i class="fas fa-trash"></i>`;
			});
		})
		.catch((error) => console.log(error));
}

function deleteStudentFromCourse(event) {
	let target = getEventTarget(event);
	if (target.className === "deleteStBtn" || "fas fa-trash") {
		let selectedTr;

		if (target.className === "deleteStBtn") {
			selectedTr = target.parentElement;
		} else if (target.className === "fas fa-trash") {
			selectedTr = target.parentElement.parentElement;
		}

		console.log("selectedtr is ", selectedTr);
		let rowFirstValue = selectedTr.cells[0].innerHTML;

		let activeLi = document.getElementsByClassName("blue")[0].innerHTML;
		console.log(activeLi);

		getDbCourses().then((data) => {
			let activeCourse = data.find((course) => course.name === activeLi);
			let selectedStudent = activeCourse.studentList.find(
				(st) => st.id == rowFirstValue
			);
			console.log("active course is", activeCourse);
			console.log("rowFirtValue  is", rowFirstValue);
			console.log("student to delete is", selectedStudent);
			let newStList = activeCourse.studentList.filter(
				(st) => st.id !== selectedStudent.id
			);
			console.log(newStList);

			axios.patch(`http://localhost:3000/courses/${activeCourse.id}`, {
				studentList: newStList,
			});
		});

		let selectedTrIndex = selectedTr.rowIndex;
		console.log("this is ", selectedTrIndex);
		table.deleteRow(selectedTrIndex);
	}
}

function createStudent(e) {
	e.preventDefault();
	let alerts = document.querySelectorAll(".alert");
	alerts.forEach((alert) => (alert.innerHTML = ""));

	let formValues = Array.from([
		parseInt(document.getElementById("studentForm").elements.item(0).value),
		document.getElementById("studentForm").elements.item(1).value,
		document.getElementById("studentForm").elements.item(2).value,
		document.getElementById("studentForm").elements["gender"].value,
		document.getElementById("studentForm").elements.item(5).value,
		document.getElementById("studentForm").elements.item(6).value,
	]);

	let requiredFields = formValues.slice(0, 4);

	try {
		if (!typeCheck.isidUnique(formValues[0]))
			throw new Error(`Student with id ${formValues[0]} already exists`);
	} catch (error) {
		document.querySelector("#idAlert").innerHTML = error;
		return;
	}

	try {
		if (!typeCheck.hasAllProperties(requiredFields))
			throw new Error("This field is required");
	} catch (error) {
		alerts.forEach((alert) => (alert.innerHTML = error));
		return;
	}

	let formNewStudent = new Student(...formValues);
	let newOp = document.createElement("option");
	newOp.innerHTML =
		formNewStudent.id +
		"," +
		formNewStudent.firstName +
		"," +
		formNewStudent.lastName +
		"," +
		formNewStudent.gender;

	studentSelect.append(newOp);
	sendStudentData(formNewStudent);
	form.reset();
}

studentSelect.addEventListener("click", function (e) {
	e.preventDefault();
	let options = studentSelect.querySelectorAll("option");
	let count = options.length;
	if (typeof count === "undefined" || count < 1) {
		alert("Have to create a student!");
	}
});

studentSelect.addEventListener("change", function (e) {
	e.preventDefault();
	let selectedOptionId = studentSelect.value.split(",")[0];
	let blueLi = document.querySelector(".blue");
	try {
		if (blueLi === null) throw "no course selected!";
	} catch (error) {
		console.log("this is the error:", error);
		alert("Please select a course!");
	}

	let activeLi = blueLi.innerHTML;

	getDbCourses()
		.then((data) => {
			let activeCourseStudents = data.find(
				(course) => course.name === activeLi
			).studentList;
			let activeCourseStsIds = activeCourseStudents.map((st) => st.id);
			for (let i = 0; i < activeCourseStsIds.length; i++) {
				if (activeCourseStsIds[i] == selectedOptionId) {
					alert(`This student is already enrolled to ${activeLi} course!`);
				}
			}

			getDbStudents()
				.then((dbStudents) => {
					let selectedStudent = dbStudents.find(
						(st) => st.id == selectedOptionId
					);

					let rowsFirstCellValue = [];
					for (let i = 0; i < table.rows.length; i++) {
						rowsFirstCellValue.push(parseInt(table.rows[i].cells[0].innerHTML));
					}

					if (
						rowsFirstCellValue.every((value) => value !== selectedStudent.id)
					) {
						let newRow = table.insertRow(table.rows.length);
						let keys = Object.keys(selectedStudent);
						let rowCellsLen = table.rows[0].cells.length;
						for (let i = 0; i < rowCellsLen - 1; i++) {
							newRow.insertCell(i).innerHTML = selectedStudent[keys[i]] || "-";
						}
						let deleteStudentButton = newRow.insertCell(6);
						deleteStudentButton.setAttribute("class", "deleteStBtn");
						deleteStudentButton.innerHTML = `<i class="fas fa-trash"></i>`;
					}
					getDbCourses()
						.then((res) => {
							let activeCourse = res.find((course) => course.name == activeLi);
							console.log("activecourse is", activeCourse);
							let stList = res.find(
								(course) => course.id == activeCourse.id
							).studentList;

							if (stList.every((item) => item.id !== selectedStudent.id)) {
								axios.patch(
									`http://localhost:3000/courses/${activeCourse.id}`,
									{
										studentList: [selectedStudent, ...stList],
									}
								);
							}
						})
						.catch((error) => console.log(error));
				})
				.catch((error) => console.log(error));
		})
		.catch((error) => console.log(error));
});

// -----modal------
const modal = document.querySelector("#myModal");
const span = document.querySelector(".close");

createStButton.onclick = function () {
	modal.style.display = "block";
};

span.onclick = function () {
	modal.style.display = "none";
};

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
};



