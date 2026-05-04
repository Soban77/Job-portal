document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());

  try {
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (data.token) {
      alert("Registered successfully!");
      localStorage.setItem('token', data.token);
      window.location.href = "index.html"; // redirect to login
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});