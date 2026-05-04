const token = localStorage.getItem('token');

function logout() {
  localStorage.removeItem('token');
  window.location.href = "index.html";
}

async function api(url, method = 'GET', body) {
  const res = await fetch(`http://localhost:5000${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadUsers() {
  try {
    const users = await api('/user');
    const el = document.getElementById('users');
    el.innerHTML = (users || []).map(u => `
      <div class="card p-3 shadow-sm mb-2">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div><b>${u.name}</b> (${u.role})</div>
            <div class="text-muted small">${u.email}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u._id}')">Delete</button>
        </div>
      </div>
    `).join('') || `<div class="text-muted">No users.</div>`;
  } catch (err) {
    alert(err.message);
  }
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    await api(`/user/${id}`, 'DELETE');
    await loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

async function loadEmployers() {
  try {
    const employers = await api('/employer');
    const el = document.getElementById('employers');
    el.innerHTML = (employers || []).map(e => `
      <div class="card p-3 shadow-sm mb-2">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div><b>${e.companyName || 'N/A'}</b></div>
            <div class="text-muted small">User: ${e.userId?.name || 'Unknown'} (${e.userId?.email || 'N/A'})</div>
            <div class="small">Verified: ${e.verificationStatus ? 'Yes' : 'No'}</div>
          </div>
          <button class="btn btn-sm ${e.verificationStatus ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="verifyEmployer('${e._id}', ${!e.verificationStatus})">
            ${e.verificationStatus ? 'Unverify' : 'Verify'}
          </button>
        </div>
      </div>
    `).join('') || `<div class="text-muted">No employer profiles.</div>`;
  } catch (err) {
    alert(err.message);
  }
}

async function verifyEmployer(id, status) {
  try {
    await api(`/employer/${id}/verify`, 'PUT', { verificationStatus: status });
    await loadEmployers();
  } catch (err) {
    alert(err.message);
  }
}

loadUsers();
loadEmployers();

