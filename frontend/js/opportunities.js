import { requireAuth, handleLogout } from './auth.js';
import { api } from './api.js';

await requireAuth();

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

let opportunities = [];
let accounts = [];
let contacts = [];
let editingId = null;

const modal = document.getElementById('oppModal');
const form = document.getElementById('oppForm');
const newOppBtn = document.getElementById('newOppBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

async function loadOpportunities() {
  try {
    [opportunities, accounts, contacts] = await Promise.all([
      api.get('/opportunities'),
      api.get('/accounts'),
      api.get('/contacts')
    ]);
    renderOpportunities();
    populateSelects();
  } catch (error) {
    console.error('Error loading opportunities:', error);
  }
}

function populateSelects() {
  const accountSelect = document.getElementById('accountId');
  const contactSelect = document.getElementById('contactId');
  
  accountSelect.innerHTML = '<option value="">None</option>' + 
    accounts.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('');
  
  contactSelect.innerHTML = '<option value="">None</option>' + 
    contacts.map(con => `<option value="${con.id}">${con.first_name} ${con.last_name}</option>`).join('');
}

function renderOpportunities() {
  const container = document.getElementById('oppsList');
  
  if (opportunities.length === 0) {
    container.innerHTML = '<p>No opportunities yet. Create your first opportunity!</p>';
    return;
  }

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Account</th>
          <th>Amount</th>
          <th>Stage</th>
          <th>Probability</th>
          <th>Close Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${opportunities.map(opp => `
          <tr>
            <td><a href="/opportunity-detail.html?id=${opp.id}">${opp.name}</a></td>
            <td>${opp.accounts ? opp.accounts.name : '-'}</td>
            <td>${opp.amount ? '$' + parseFloat(opp.amount).toLocaleString() : '-'}</td>
            <td><span class="badge">${opp.stage}</span></td>
            <td>${opp.probability ? opp.probability + '%' : '-'}</td>
            <td>${opp.close_date || '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="window.editOpportunity('${opp.id}')">Edit</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function openModal(opp = null) {
  editingId = opp ? opp.id : null;
  document.getElementById('modalTitle').textContent = opp ? 'Edit Opportunity' : 'New Opportunity';
  
  if (opp) {
    document.getElementById('name').value = opp.name || '';
    document.getElementById('accountId').value = opp.account_id || '';
    document.getElementById('contactId').value = opp.contact_id || '';
    document.getElementById('amount').value = opp.amount || '';
    document.getElementById('stage').value = opp.stage || 'qualify';
    document.getElementById('probability').value = opp.probability || '';
    document.getElementById('closeDate').value = opp.close_date || '';
    document.getElementById('description').value = opp.description || '';
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

newOppBtn.addEventListener('click', () => openModal());
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
    account_id: document.getElementById('accountId').value || null,
    contact_id: document.getElementById('contactId').value || null,
    amount: document.getElementById('amount').value || null,
    stage: document.getElementById('stage').value,
    probability: document.getElementById('probability').value || null,
    close_date: document.getElementById('closeDate').value || null,
    description: document.getElementById('description').value
  };

  try {
    if (editingId) {
      await api.put(`/opportunities/${editingId}`, data);
    } else {
      await api.post('/opportunities', data);
    }
    
    closeModal();
    loadOpportunities();
  } catch (error) {
    document.getElementById('formError').textContent = error.message;
  }
});

window.editOpportunity = function(id) {
  const opp = opportunities.find(o => o.id === id);
  if (opp) {
    openModal(opp);
  }
};

const params = new URLSearchParams(window.location.search);
const editId = params.get('edit');

if (editId) {
  api.get(`/opportunities/${editId}`).then(opp => {
    openModal(opp);
  });
}

loadOpportunities();