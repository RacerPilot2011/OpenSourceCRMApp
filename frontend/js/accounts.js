import { requireAuth, handleLogout } from './auth.js';
import { api } from './api.js';

await requireAuth();

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

let accounts = [];
let editingId = null;

const modal = document.getElementById('accountModal');
const form = document.getElementById('accountForm');
const newAccountBtn = document.getElementById('newAccountBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

async function loadAccounts() {
  try {
    accounts = await api.get('/accounts');
    renderAccounts();
  } catch (error) {
    console.error('Error loading accounts:', error);
  }
}

function renderAccounts() {
  const container = document.getElementById('accountsList');
  
  if (accounts.length === 0) {
    container.innerHTML = '<p>No accounts yet. Create your first account!</p>';
    return;
  }

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Industry</th>
          <th>Phone</th>
          <th>City</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${accounts.map(account => `
          <tr>
            <td><a href="/account-detail.html?id=${account.id}">${account.name}</a></td>
            <td>${account.industry || '-'}</td>
            <td>${account.phone || '-'}</td>
            <td>${account.city || '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="window.editAccount('${account.id}')">Edit</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function openModal(account = null) {
  editingId = account ? account.id : null;
  document.getElementById('modalTitle').textContent = account ? 'Edit Account' : 'New Account';
  
  if (account) {
    document.getElementById('name').value = account.name || '';
    document.getElementById('industry').value = account.industry || '';
    document.getElementById('website').value = account.website || '';
    document.getElementById('phone').value = account.phone || '';
    document.getElementById('address').value = account.address || '';
    document.getElementById('city').value = account.city || '';
    document.getElementById('state').value = account.state || '';
    document.getElementById('postalCode').value = account.postal_code || '';
    document.getElementById('country').value = account.country || '';
  } else {
    form.reset();
  }
  
  modal.style.display = 'block';
}
function closeModal() {
  modal.style.display = 'none';
  form.reset();
  editingId = null;
  document.getElementById('formError').textContent = '';
}

newAccountBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('name').value,
    industry: document.getElementById('industry').value,
    website: document.getElementById('website').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postal_code: document.getElementById('postalCode').value,
    country: document.getElementById('country').value
  };
  try {
    if (editingId) {
      await api.put(`/accounts/${editingId}`, data);
    } else {
      await api.post('/accounts', data);
    }
    closeModal();
    loadAccounts();
  } catch (error) {
    document.getElementById('formError').textContent = error.message;
  }
});

window.editAccount = function(id) {
  const account = accounts.find(a => a.id === id);
  if (account) {
    openModal(account);
  }
};

const params = new URLSearchParams(window.location.search);
const editId = params.get('edit');
if (editId) {
  api.get(`/accounts/${editId}`).then(account => {
    openModal(account);
  });
}

loadAccounts();
