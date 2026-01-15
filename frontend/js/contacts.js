import { requireAuth, handleLogout } from './auth.js';
import { api } from './api.js';

await requireAuth();

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

let contacts = [];
let accounts = [];
let editingId = null;

const modal = document.getElementById('contactModal');
const form = document.getElementById('contactForm');
const newContactBtn = document.getElementById('newContactBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

async function loadContacts() {
  try {
    [contacts, accounts] = await Promise.all([
      api.get('/contacts'),
      api.get('/accounts')
    ]);
    renderContacts();
    populateAccountSelect();
  } catch (error) {
    console.error('Error loading contacts:', error);
  }
}

function populateAccountSelect() {
  const select = document.getElementById('accountId');
  select.innerHTML = '<option value="">None</option>' + 
    accounts.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('');
}

function renderContacts() {
  const container = document.getElementById('contactsList');
  
  if (contacts.length === 0) {
    container.innerHTML = '<p>No contacts yet. Create your first contact!</p>';
    return;
  }

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Account</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${contacts.map(contact => `
          <tr>
            <td><a href="/contact-detail.html?id=${contact.id}">${contact.first_name} ${contact.last_name}</a></td>
            <td>${contact.accounts ? contact.accounts.name : '-'}</td>
            <td>${contact.email || '-'}</td>
            <td>${contact.phone || '-'}</td>
            <td>${contact.title || '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="window.editContact('${contact.id}')">Edit</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function openModal(contact = null) {
  editingId = contact ? contact.id : null;
  document.getElementById('modalTitle').textContent = contact ? 'Edit Contact' : 'New Contact';
  
  if (contact) {
    document.getElementById('firstName').value = contact.first_name || '';
    document.getElementById('lastName').value = contact.last_name || '';
    document.getElementById('accountId').value = contact.account_id || '';
    document.getElementById('email').value = contact.email || '';
    document.getElementById('phone').value = contact.phone || '';
    document.getElementById('mobile').value = contact.mobile || '';
    document.getElementById('title').value = contact.title || '';
    document.getElementById('department').value = contact.department || '';
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

newContactBtn.addEventListener('click', () => openModal());
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
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    account_id: document.getElementById('accountId').value || null,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    mobile: document.getElementById('mobile').value,
    title: document.getElementById('title').value,
    department: document.getElementById('department').value
  };

  try {
    if (editingId) {
      await api.put(`/contacts/${editingId}`, data);
    } else {
      await api.post('/contacts', data);
    }
    
    closeModal();
    loadContacts();
  } catch (error) {
    document.getElementById('formError').textContent = error.message;
  }
});

window.editContact = function(id) {
  const contact = contacts.find(c => c.id === id);
  if (contact) {
    openModal(contact);
  }
};

const params = new URLSearchParams(window.location.search);
const editId = params.get('edit');

if (editId) {
  api.get(`/contacts/${editId}`).then(contact => {
    openModal(contact);
  });
}

loadContacts();