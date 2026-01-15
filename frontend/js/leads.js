import { requireAuth, handleLogout } from './auth.js';
import { api } from './api.js';

await requireAuth();

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

let leads = [];
let editingId = null;

const modal = document.getElementById('leadModal');
const form = document.getElementById('leadForm');
const newLeadBtn = document.getElementById('newLeadBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

async function loadLeads() {
  try {
    leads = await api.get('/leads');
    renderLeads();
  } catch (error) {
    console.error('Error loading leads:', error);
  }
}

function renderLeads() {
  const container = document.getElementById('leadsList');
  
  if (leads.length === 0) {
    container.innerHTML = '<p>No leads yet. Create your first lead!</p>';
    return;
  }

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Rating</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(lead => `
          <tr>
            <td><a href="/lead-detail.html?id=${lead.id}">${lead.first_name} ${lead.last_name}</a></td>
            <td>${lead.company || '-'}</td>
            <td>${lead.email || '-'}</td>
            <td>${lead.phone || '-'}</td>
            <td><span class="badge">${lead.status}</span></td>
            <td>${lead.rating ? `<span class="badge">${lead.rating}</span>` : '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="window.editLead('${lead.id}')">Edit</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function openModal(lead = null) {
  editingId = lead ? lead.id : null;
  document.getElementById('modalTitle').textContent = lead ? 'Edit Lead' : 'New Lead';
  
  if (lead) {
    document.getElementById('firstName').value = lead.first_name || '';
    document.getElementById('lastName').value = lead.last_name || '';
    document.getElementById('email').value = lead.email || '';
    document.getElementById('phone').value = lead.phone || '';
    document.getElementById('company').value = lead.company || '';
    document.getElementById('title').value = lead.title || '';
    document.getElementById('status').value = lead.status || 'new';
    document.getElementById('rating').value = lead.rating || '';
    document.getElementById('source').value = lead.source || '';
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

newLeadBtn.addEventListener('click', () => openModal());
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
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    company: document.getElementById('company').value,
    title: document.getElementById('title').value,
    status: document.getElementById('status').value,
    rating: document.getElementById('rating').value || null,
    source: document.getElementById('source').value
  };

  try {
    if (editingId) {
      await api.put(`/leads/${editingId}`, data);
    } else {
      await api.post('/leads', data);
    }
    
    closeModal();
    loadLeads();
  } catch (error) {
    document.getElementById('formError').textContent = error.message;
  }
});

window.editLead = function(id) {
  const lead = leads.find(l => l.id === id);
  if (lead) {
    openModal(lead);
  }
};

const params = new URLSearchParams(window.location.search);
const editId = params.get('edit');

if (editId) {
  api.get(`/leads/${editId}`).then(lead => {
    openModal(lead);
  });
}

loadLeads();