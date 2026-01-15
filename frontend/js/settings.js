import { requireAuth, handleLogout, getCurrentUser } from './auth.js';
import { api } from './api.js';

await requireAuth();

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

let currentUser = null;

async function loadSettings() {
  try {
    currentUser = await getCurrentUser();
    
    const org = await api.get('/organizations');
    const users = await api.get('/users');

    document.getElementById('orgInfo').innerHTML = `
      <div class="detail-row">
        <span class="label">Name:</span>
        <span>${org.name}</span>
      </div>
      <div class="detail-row">
        <span class="label">Created:</span>
        <span>${new Date(org.created_at).toLocaleDateString()}</span>
      </div>
    `;

    const usersHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.full_name || '-'}</td>
              <td>${user.email}</td>
              <td><span class="badge">${user.role}</span></td>
              <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('usersList').innerHTML = usersHtml;

  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

loadSettings();