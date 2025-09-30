// Common functions

// Check login status and redirect if not logged in
function checkLogin() {
  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
}

// Logout function
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedIn');
      alert('You have been logged out.');
      window.location.href = 'login.html';
    });
  }
}

// LOGIN PAGE SCRIPT
function loginPageScript() {
  // Redirect if already logged in
  if (localStorage.getItem('loggedIn') === 'true') {
    window.location.href = 'index.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = this.username.value.trim();
    const password = this.password.value.trim();

    if (!username || !password) {
      alert('Please enter username and password.');
      return;
    }

    // Hardcoded demo credentials
    if (username === 'admin' && password === 'password') {
      localStorage.setItem('loggedIn', 'true');
      alert('Login successful!');
      window.location.href = 'index.html';
    } else {
      alert('Invalid username or password.');
    }
  });
}

// REGISTER PAGE SCRIPT
function registerPageScript() {
  checkLogin();
  setupLogoutButton();

  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const studentId = form.studentId.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const course = form.course.value;

    if (!studentId || !name || !email || !course) {
      alert('Please fill out all fields.');
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email.');
      return;
    }

    // Save student data in localStorage
    let students = JSON.parse(localStorage.getItem('students')) || [];

    // Check duplicate studentId (case-insensitive)
    if (students.some(s => s.studentId.toLowerCase() === studentId.toLowerCase())) {
      alert('Student ID already registered.');
      return;
    }

    students.push({ studentId, name, email, course });
    localStorage.setItem('students', JSON.stringify(students));

    alert('Student registered successfully!');

    form.reset();
  });
}

// STUDENTS LIST PAGE SCRIPT
function studentsPageScript() {
  checkLogin();
  setupLogoutButton();

  const tbody = document.getElementById('studentsBody');
  if (!tbody) return;

  function loadStudents() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    tbody.innerHTML = '';

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No students registered.</td></tr>';
      return;
    }

    students.forEach((student, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${student.studentId}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td>
          <button class="edit-btn" data-index="${index}">Edit</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  tbody.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
      const idx = e.target.getAttribute('data-index');
      if (confirm('Are you sure you want to delete this student?')) {
        let students = JSON.parse(localStorage.getItem('students')) || [];
        students.splice(idx, 1);
        localStorage.setItem('students', JSON.stringify(students));
        loadStudents();
      }
    }

    if (e.target.classList.contains('edit-btn')) {
      const idx = e.target.getAttribute('data-index');
      let students = JSON.parse(localStorage.getItem('students')) || [];
      const student = students[idx];
      const newName = prompt('Enter new name:', student.name);
      if (newName === null) return; // Cancelled
      const newEmail = prompt('Enter new email:', student.email);
      if (newEmail === null) return;

      // Validate email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(newEmail.trim())) {
        alert('Invalid email format.');
        return;
      }

      student.name = newName.trim() || student.name;
      student.email = newEmail.trim() || student.email;

      students[idx] = student;
      localStorage.setItem('students', JSON.stringify(students));
      loadStudents();
    }
  });

  loadStudents();
}

// TIMETABLE PAGE SCRIPT
function timetablePageScript() {
  checkLogin();
  setupLogoutButton();

  const timetableData = {
    cyber: {
      "9:00 - 10:00": { Mon: "Network Security", Tue: "Cryptography", Wed: "Cyber Law", Thu: "Ethical Hacking", Fri: "Malware Analysis" },
      "10:15 - 11:15": { Mon: "Firewalls", Tue: "Intrusion Detection", Wed: "Penetration Testing", Thu: "Forensics", Fri: "Security Policies" },
      "11:30 - 12:30": { Mon: "VPN", Tue: "Risk Management", Wed: "Secure Coding", Thu: "Threat Modeling", Fri: "Incident Response" }
    },
    multimedia: {
      "9:00 - 10:00": { Mon: "Graphic Design", Tue: "Video Editing", Wed: "Animation", Thu: "Photography", Fri: "UI/UX Design" },
      "10:15 - 11:15": { Mon: "Sound Design", Tue: "3D Modeling", Wed: "Web Design", Thu: "Motion Graphics", Fri: "Creative Writing" },
      "11:30 - 12:30": { Mon: "Digital Illustration", Tue: "Visual Effects", Wed: "Storyboarding", Thu: "Game Design", Fri: "Advertising" }
    },
    software: {
      "9:00 - 10:00": { Mon: "Programming Basics", Tue: "Data Structures", Wed: "Algorithms", Thu: "Databases", Fri: "Software Testing" },
      "10:15 - 11:15": { Mon: "Web Development", Tue: "Mobile Apps", Wed: "Cloud Computing", Thu: "APIs", Fri: "DevOps" },
      "11:30 - 12:30": { Mon: "OOP", Tue: "Design Patterns", Wed: "Agile", Thu: "Version Control", Fri: "Microservices" }
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const courseSelect = document.getElementById('courseSelect');
  const timetableTable = document.getElementById('timetableTable');
  const timetableBody = document.getElementById('timetableBody');

  if (!courseSelect || !timetableTable || !timetableBody) return;

  function renderTable(courseKey) {
    timetableBody.innerHTML = '';

    const courseSchedule = timetableData[courseKey];
    if (!courseSchedule) {
      timetableTable.style.display = 'none';
      return;
    }

    for (const time in courseSchedule) {
      const tr = document.createElement('tr');

      // Time column
      const timeTd = document.createElement('td');
      timeTd.textContent = time;
      timeTd.style.fontWeight = '700';
      tr.appendChild(timeTd);

      // Days columns
      days.forEach(day => {
        const td = document.createElement('td');
        const subject = courseSchedule[time][day];
        td.textContent = subject || '-';
        if (!subject) td.classList.add('empty');
        tr.appendChild(td);
      });

      timetableBody.appendChild(tr);
    }
    timetableTable.style.display = 'table';
  }

  courseSelect.addEventListener('change', function () {
    renderTable(this.value);
  });
}
