import { requireAuth, handleLogout } from './auth.js';

export async function initApp() {
  await requireAuth();
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
}