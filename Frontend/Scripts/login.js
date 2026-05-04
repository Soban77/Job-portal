document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());

  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert("Login successful!");

      if (data.user.role === "employer") {
        window.location.href = "employer_dashboard.html";
      } else if (data.user.role === "seeker") {
        window.location.href = "Job_Seeker/seeker_dashboard.html";
      } else if (data.user.role === "admin") {
        window.location.href = "admin_dashboard.html";
      }
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
