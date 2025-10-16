// Basic routing and voice input setup
let currentPage = 'login'; // 'login', 'symptoms', 'recommendation', 'booking', 'success', 'patientDashboard', 'adminDashboard'
let lastRecommendation = null;
let lastAppointment = null;
let user = { email: '', role: '' };

// Entry point
window.onload = function () {
  renderPage();
};

function renderPage() {
  const root = document.getElementById("root");
  if (currentPage === 'login') {
    root.innerHTML = `
      <div class="container">
        <h1>Welcome to Ethical AI Hospital</h1>
        <div id="loginForm" class="form-section">
          <h2>Login</h2>
          <input type="email" id="email" placeholder="Email" />
          <input type="password" id="password" placeholder="Password" />
          <button onclick="login()">Login</button>
          <p id="loginMessage"></p>
        </div>
      </div>
    `;
  } else if (currentPage === 'symptoms') {
    root.innerHTML = `
      <div class="container">
        <h1>Ethical AI Hospital</h1>
        <div id="symptomSection" class="form-section">
          <h2>Describe Your Symptoms</h2>
          <textarea id="symptoms" placeholder="Describe your symptoms..."></textarea>
          <button id="speakBtn">🎤 Start Speaking</button>
          <button onclick="getRecommendation()">Get Doctor Recommendation</button>
          <button onclick="logout()">Logout</button>
          <p id="output"></p>
        </div>
      </div>
    `;
    attachSymptomEvents();
  } else if (currentPage === 'recommendation') {
    root.innerHTML = `
      <div class="container">
        <h1>Ethical AI Hospital</h1>
        <div class="form-section">
          <h2>Recommended Doctor:</h2>
          <p>${lastRecommendation.doctor}</p>
          <p>${lastRecommendation.explanation}</p>
          <button onclick="goToBooking()">Book Appointment</button>
          <button onclick="goToSymptoms()">Back</button>
        </div>
      </div>
    `;
  } else if (currentPage === 'booking') {
    root.innerHTML = `
      <div class="container">
        <h1>Book Appointment</h1>
        <div class="form-section">
          <p><b>Doctor:</b> ${lastRecommendation.doctor}</p>
          <p><b>Symptoms:</b> ${document.getElementById('symptoms') ? document.getElementById('symptoms').value : ''}</p>
          <button onclick="bookAppointment()">Confirm Booking</button>
          <button onclick="goToSymptoms()">Back</button>
          <p id="bookingMessage"></p>
        </div>
      </div>
    `;
  } else if (currentPage === 'success') {
    root.innerHTML = `
      <div class="container">
        <h1>Appointment Booked!</h1>
        <div class="form-section">
          <p>Your appointment has been successfully booked.</p>
          <div class="appointment-details">
            <h3>Appointment Details:</h3>
            <p><strong>Doctor:</strong> ${lastAppointment.doctor}</p>
            <p><strong>Symptoms:</strong> ${lastAppointment.symptoms}</p>
          </div>
          <button onclick="goToDashboard()">Go to Dashboard</button>
        </div>
      </div>
    `;
  } else if (currentPage === 'patientDashboard') {
    root.innerHTML = `
      <div class="container">
        <h1>Patient Dashboard</h1>
        <div class="form-section">
          <button onclick="logout()">Logout</button>
          <h2>Your Appointments</h2>
          <div id="appointmentsList">Loading...</div>
        </div>
      </div>
    `;
    fetchAppointments();
  } else if (currentPage === 'adminDashboard') {
    root.innerHTML = `
      <div class="container">
        <h1>Admin Dashboard</h1>
        <div class="form-section">
          <button onclick="logout()">Logout</button>
          <h2>All Appointments</h2>
          <div id="appointmentsList">Loading...</div>
        </div>
      </div>
    `;
    fetchAppointments(true);
  }
}

function attachSymptomEvents() {
  const output = document.getElementById("output");
  const speakBtn = document.getElementById("speakBtn");
  if (speakBtn) {
    speakBtn.onclick = () => {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.start();
      recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("symptoms").value = transcript;
        output.textContent = "You said: " + transcript;
      };
    };
  }
}

// Navigation functions
function goToLogin() {
  currentPage = 'login';
  renderPage();
}
function goToSymptoms() {
  currentPage = 'symptoms';
  renderPage();
}
function goToBooking() {
  currentPage = 'booking';
  renderPage();
}
function goToDashboard() {
  if (user.role === 'admin') {
    currentPage = 'adminDashboard';
  } else {
    currentPage = 'patientDashboard';
  }
  renderPage();
}
function logout() {
  user = { email: '', role: '' };
  currentPage = 'login';
  renderPage();
}

// Login function
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.status === "success") {
      user = { email: data.email, role: data.role };
      if (user.role === 'admin') {
        currentPage = 'adminDashboard';
      } else {
        currentPage = 'symptoms';
      }
      renderPage();
    } else {
      document.getElementById("loginMessage").textContent = "Invalid credentials";
    }
  } catch (error) {
    document.getElementById("loginMessage").textContent = "Error connecting to server";
  }
}

// Get doctor recommendation
async function getRecommendation() {
  const symptoms = document.getElementById("symptoms").value;
  try {
    const response = await fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms })
    });
    const data = await response.json();
    lastRecommendation = data;
    currentPage = 'recommendation';
    renderPage();
  } catch (error) {
    document.getElementById("output").textContent = "Error getting recommendation";
  }
}

// Book appointment
async function bookAppointment() {
  const symptoms = document.getElementById('symptoms') ? document.getElementById('symptoms').value : '';
  try {
    const response = await fetch('http://localhost:5000/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        doctor: lastRecommendation.doctor,
        symptoms: symptoms
      })
    });
    const data = await response.json();
    // Store doctor and symptoms for success page
    lastAppointment = {
      ...data,
      doctor: lastRecommendation.doctor,
      symptoms: symptoms
    };
    currentPage = 'success';
    renderPage();
  } catch (error) {
    document.getElementById("bookingMessage").textContent = "Error booking appointment";
  }
}

// Fetch appointments for dashboard
async function fetchAppointments(isAdmin) {
  let url = `http://localhost:5000/appointments?email=${user.email}&role=${user.role}`;
  const listDiv = document.getElementById('appointmentsList');
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length === 0) {
      listDiv.innerHTML = '<p>No appointments found.</p>';
      return;
    }
    let html = '<ul style="padding-left:0;">';
    data.forEach(app => {
      html += `<li style="list-style:none; margin-bottom:16px; border-bottom:1px solid #eee; padding-bottom:8px;">
        <b>Doctor:</b> ${app.doctor}<br/>
        <b>Symptoms:</b> ${app.symptoms}<br/>
        <b>Status:</b> ${app.status}<br/>
        <b>Details Sent:</b> ${app.details_sent ? 'Yes' : 'No'}<br/>
        ${isAdmin ? `<b>Patient:</b> ${app.patient_email}<br/><button onclick="sendDetails(${app.id})" ${app.details_sent ? 'disabled' : ''}>Send Details (SMS/Email)</button>` : ''}
      </li>`;
    });
    html += '</ul>';
    listDiv.innerHTML = html;
  } catch (error) {
    listDiv.innerHTML = '<p>Error loading appointments.</p>';
  }
}

// Admin: send appointment details
async function sendDetails(appointmentId) {
  try {
    await fetch('http://localhost:5000/send_appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointment_id: appointmentId })
    });
    fetchAppointments(true);
  } catch (error) {
    alert('Error sending details');
  }
}
