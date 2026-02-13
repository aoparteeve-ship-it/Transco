// Elements
let regName = document.getElementById("regName");
let regSection = document.getElementById("regSection");
let regPhoto = document.getElementById("regPhoto");
let regBtn = document.getElementById("regBtn");

let stuSelect = document.getElementById("stuSelect");
let markBtn = document.getElementById("markBtn");
let attendanceList = document.getElementById("attendanceList");
let downloadBtn = document.getElementById("downloadBtn");
let clearBtn = document.getElementById("clearBtn");
let currentDateSpan = document.getElementById("currentDate");

// Current Date
let today = new Date();
let dateStr = today.toLocaleDateString();
currentDateSpan.textContent = dateStr;

// Load students & attendance
let students = JSON.parse(localStorage.getItem("students")) || [];
let attendanceData = JSON.parse(localStorage.getItem("dailyAttendance")) || [];

// Populate student dropdown
function populateDropdown(){
    stuSelect.innerHTML = `<option value="">--Select--</option>`;
    students.forEach((stu, index) => {
        stuSelect.innerHTML += `<option value="${index}">${stu.name} (${stu.section})</option>`;
    });
}
populateDropdown();

// Add student registration
regBtn.addEventListener("click", function(){
    let name = regName.value.trim();
    let section = regSection.value.trim();
    let photoFile = regPhoto.files[0];

    if(!name || !section || !photoFile){
        alert("Enter name, section and upload photo!");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(e){
        let photoData = e.target.result; // Base64

        students.push({name, section, photo: photoData});
        localStorage.setItem("students", JSON.stringify(students));
        populateDropdown();

        regName.value = "";
        regSection.value = "";
        regPhoto.value = "";
        alert("Student Registered!");
    }
    reader.readAsDataURL(photoFile);
});

// Function – Add attendance list item
function addListItem(entry){
    let li = document.createElement("li");

    // Photo
    let img = document.createElement("img");
    img.src = entry.photo;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.marginRight = "10px";

    li.appendChild(img);
    li.appendChild(document.createTextNode(`${entry.name} - Section: ${entry.section} - Date: ${entry.date} - Status: ${entry.status}`));

    // Remove button
    let removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "10px";
    removeBtn.addEventListener("click", function(){
        attendanceList.removeChild(li);
        attendanceData = attendanceData.filter(e => !(e.name === entry.name && e.date === entry.date));
        localStorage.setItem("dailyAttendance", JSON.stringify(attendanceData));
    });

    li.appendChild(removeBtn);
    attendanceList.appendChild(li);
}

// Load existing attendance
attendanceData.forEach(entry => addListItem(entry));

// Mark Attendance
markBtn.addEventListener("click", function(){
    let stuIndex = stuSelect.value;
    if(stuIndex === ""){
        alert("Select a student!");
        return;
    }

    let stu = students[stuIndex];

    // Check if already marked today
    let alreadyMarked = attendanceData.find(e => e.name === stu.name && e.date === dateStr);
    if(alreadyMarked){
        alert("Attendance already marked for today!");
        return;
    }

    let now = new Date();
    let status = (now.getHours() >= 10) ? "Late" : "Present";

    let entry = {name: stu.name, section: stu.section, date: dateStr, status: status, photo: stu.photo};
    attendanceData.push(entry);
    localStorage.setItem("dailyAttendance", JSON.stringify(attendanceData));

    addListItem(entry);
});

// Download CSV
downloadBtn.addEventListener("click", function(){
    if(attendanceData.length === 0){ alert("No data to download!"); return; }

    let csvContent = "data:text/csv;charset=utf-8,Name,Section,Date,Status\n";
    attendanceData.forEach(entry => {
        csvContent += `${entry.name},${entry.section},${entry.date},${entry.status}\n`;
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "daily_attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Clear All
clearBtn.addEventListener("click", function(){
    if(attendanceData.length === 0) return;
    if(!confirm("Clear all attendance?")) return;

    attendanceList.innerHTML = "";
    attendanceData = [];
    localStorage.removeItem("dailyAttendance");
});

