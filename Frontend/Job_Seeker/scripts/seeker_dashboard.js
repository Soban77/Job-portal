const token = localStorage.getItem('token');

async function loadJobs() {
  const res = await fetch('http://localhost:5000/job', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const jobs = await res.json();

  const jobList = document.getElementById('jobList');
  jobList.innerHTML = jobs.map(job => `
    <div class="col-md-6">
      <div class="card p-3 shadow-sm">
        <h5>${job.title}</h5>
        <p>${job.description}</p>
        <button class="btn btn-success w-100" onclick="applyJob('${job._id}')">Apply</button>
      </div>
    </div>
  `).join('');
}

async function applyJob(jobId) {
  const res = await fetch(`http://localhost:5000/job/${jobId}/apply`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
  });
  const data = await res.json();
  alert(data.message || data.error);
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch('http://localhost:5000/user/profile', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message || data.error);
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = "index.html";
}

loadJobs();