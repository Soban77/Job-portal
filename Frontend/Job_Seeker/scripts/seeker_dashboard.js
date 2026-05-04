const token = localStorage.getItem('token');

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '../index.html';
}

async function loadJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `http://localhost:5000/job${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  const jobs = await res.json();

  const jobList = document.getElementById('jobList');
  jobList.innerHTML = (Array.isArray(jobs) ? jobs : []).map(job => `
    <div class="col-md-6">
      <div class="card p-3 shadow-sm job-card">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 class="mb-1">${job.title}</h5>
            <div class="small text-muted">${job.category || 'General'}</div>
          </div>
          <span class="small-tag info">${job.status}</span>
        </div>
        <p>${job.description || ''}</p>
        <div class="mb-2">
          ${(Array.isArray(job.skillsRequired) ? job.skillsRequired : []).map(skill => `<span class="small-tag soft">${skill}</span>`).join(' ')}
        </div>
        <button class="btn btn-primary w-100 mb-2" onclick="viewJob('${job._id}')">View Details</button>
        <button class="btn btn-success w-100" onclick="applyJob('${job._id}')">Apply</button>
      </div>
    </div>
  `).join('') || `<div class="text-muted">No jobs match this search.</div>`;
}

async function applyJob(jobId) {
  const res = await fetch('http://localhost:5000/application', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ jobId })
  });
  const data = await res.json();
  alert(data.message || data.error || 'Unable to apply');
  await loadApplications();
}

function viewJob(jobId) {
  window.location.href = `job_details.html?id=${jobId}`;
}

function viewApplication(appId) {
  window.location.href = `application_details.html?id=${appId}`;
}

async function loadApplications() {
  const res = await fetch('http://localhost:5000/application', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const apps = await res.json();
  const el = document.getElementById('applications');
  el.innerHTML = (Array.isArray(apps) ? apps : []).map(a => `
    <div class="card p-3 shadow-sm mb-2">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 class="mb-1">${a.jobId?.title || 'Application'}</h6>
          <div class="text-muted small">Status: ${a.status}</div>
        </div>
        <span class="small-tag info">${new Date(a.appliedDate).toLocaleDateString()}</span>
      </div>
      <div class="small text-muted">Job: ${a.jobId?.category || 'N/A'}</div>
      ${a.interviewDate ? `<div class="mt-2">Interview: ${new Date(a.interviewDate).toLocaleString()}</div>` : ''}
      <button class="btn btn-sm btn-primary mt-2" onclick="viewApplication('${a._id}')">View Details</button>
    </div>
  `).join('') || `<div class="text-muted">No applications yet.</div>`;
}

async function loadProfile() {
  const res = await fetch('http://localhost:5000/user/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.error) return;
  document.querySelector('input[name="name"]').value = data.name || '';
  document.querySelector('input[name="skills"]').value = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
  document.querySelector('input[name="resumeURL"]').value = data.resumeURL || '';
  document.querySelector('textarea[name="profileInfo"]').value = data.profileInfo || '';
}

async function sendMessage(formData) {
  const res = await fetch('http://localhost:5000/message', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(formData)
  });
  return res.json();
}

async function loadMessages() {
  const res = await fetch('http://localhost:5000/message', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const messages = await res.json();
  const el = document.getElementById('messages');
  el.innerHTML = (Array.isArray(messages) ? messages : []).map(m => {
    const sender = m.senderId?.name || m.senderId || 'You';
    const receiver = m.receiverId?.name || m.receiverId || 'Unknown';
    return `
      <div class="card p-3 shadow-sm mb-2">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="small text-muted">From: ${sender} → To: ${receiver}</div>
            <div>${m.messageText}</div>
          </div>
          <span class="small-tag info">${new Date(m.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    `;
  }).join('') || `<div class="text-muted">No messages yet.</div>`;
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  if (typeof formData.skills === 'string') {
    formData.skills = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  const res = await fetch('http://localhost:5000/user/me', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  alert(data.message || data.error || 'Profile update failed');
});

document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const data = await sendMessage(formData);
  alert(data.message || data.error || 'Unable to send message');
  if (!data.error) {
    e.target.reset();
    await loadMessages();
  }
});

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  await loadJobs(formData);
});

function resetFilters() {
  document.getElementById('searchForm').reset();
  loadJobs();
}

loadJobs();
loadApplications();
loadProfile();
loadMessages();