const token = localStorage.getItem('token');

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

async function api(method, url, body) {
  const res = await fetch(`http://localhost:5000${url}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadMyJobs() {
  try {
    const jobs = await api('GET', '/job/my');
    const el = document.getElementById('myJobs');
    el.innerHTML = (jobs || []).map(j => `
      <div class="col-md-6 mb-3">
        <div class="card p-3 shadow-sm">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 class="mb-1">${j.title}</h5>
              <div class="small text-muted">${j.category || 'General'}</div>
            </div>
            <span class="small-tag info">${j.status}</span>
          </div>
          <p>${j.description || ''}</p>
          <div class="mb-2">
            ${(Array.isArray(j.skillsRequired) ? j.skillsRequired : []).map(skill => `<span class="small-tag soft">${skill}</span>`).join(' ')}
          </div>
          <button class="btn btn-danger btn-sm" onclick="deleteJob('${j._id}')">Delete</button>
        </div>
      </div>
    `).join('') || `<div class="text-muted">No jobs posted yet.</div>`;
  } catch (err) {
    alert(err.message);
  }
}

async function loadMyJobs() {
  try {
    const me = await api('GET', '/user/me');
    const allJobs = await fetch('http://localhost:5000/job').then(r => r.json());
    const mine = Array.isArray(allJobs) ? allJobs.filter(j => j.employerId === me._id) : [];

    const el = document.getElementById('myJobs');
    el.innerHTML = mine.map(j => `
      <div class="col-md-6">
        <div class="card p-3 shadow-sm job-card">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 class="mb-1">${j.title}</h5>
              <div class="small text-muted">${j.category || 'General'}</div>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteJob('${j._id}')">Delete</button>
          </div>
          <p>${j.description || ''}</p>
          <div class="small text-muted">Status: ${j.status}</div>
        </div>
      </div>
    `).join('') || `<div class="text-muted">No jobs yet.</div>`;
  } catch (err) {
    alert(err.message);
  }
}

async function deleteJob(id) {
  if (!confirm('Delete this job?')) return;
  try {
    await api('DELETE', `/job/${id}`);
    await loadMyJobs();
  } catch (err) {
    alert(err.message);
  }
}

async function loadApplications() {
  try {
    const apps = await api('GET', '/application');
    const el = document.getElementById('applications');
    el.innerHTML = (apps || []).map(a => `
      <div class="card p-3 shadow-sm mb-2">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="mb-1">${a.jobId?.title || 'Application'}</h6>
            <div class="small text-muted">Candidate: ${a.seekerId?.name || 'Unknown'}</div>
          </div>
          <span class="small-tag info">${a.status}</span>
        </div>
        <div class="small text-muted">Resume: ${a.resumeURL || a.seekerId?.resumeURL || 'No resume'}</div>
        <div class="mt-2">Applied: ${new Date(a.appliedDate).toLocaleDateString()}</div>
        ${a.interviewDate ? `<div class="mt-2">Interview: ${new Date(a.interviewDate).toLocaleString()}</div>` : ''}
        <div class="mt-3 d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-primary" onclick="setStatus('${a._id}','shortlisted')">Shortlist</button>
          <button class="btn btn-sm btn-outline-primary" onclick="setStatus('${a._id}','interview')">Interview</button>
          <button class="btn btn-sm btn-outline-danger" onclick="setStatus('${a._id}','rejected')">Reject</button>
        </div>
      </div>
    `).join('') || `<div class="text-muted">No applications yet.</div>`;
  } catch (err) {
    alert(err.message);
  }
}

async function setStatus(appId, status) {
  try {
    await api('PUT', `/application/${appId}/status`, { status });
    await loadApplications();
  } catch (err) {
    alert(err.message);
  }
}

async function loadMessages() {
  try {
    const res = await fetch('http://localhost:5000/message', { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    const messages = await res.json();
    const el = document.getElementById('messages');
    el.innerHTML = (Array.isArray(messages) ? messages : []).map(m => {
      const sender = m.senderId?.name || m.senderId || 'Unknown';
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
  } catch (err) {
    alert(err.message);
  }
}

async function sendEmployerMessage(reqBody) {
  const res = await fetch('http://localhost:5000/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(reqBody)
  });
  return res.json();
}

document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const result = await sendEmployerMessage(formData);
  alert(result.message || result.error || 'Unable to send message');
  if (!result.error) {
    e.target.reset();
    await loadMessages();
  }
});

loadMyJobs();
loadApplications();
loadMessages();

