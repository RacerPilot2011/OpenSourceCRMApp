require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authenticateToken } = require('./middleware/auth');

const organizationsRoutes = require('./routes/organizations');
const usersRoutes = require('./routes/users');
const accountsRoutes = require('./routes/accounts');
const contactsRoutes = require('./routes/contacts');
const leadsRoutes = require('./routes/leads');
const opportunitiesRoutes = require('./routes/opportunities');
const activitiesRoutes = require('./routes/activities');
const invoicesRoutes = require('./routes/invoices');
const expensesRoutes = require('./routes/expenses');
const bootstrapRoutes = require('./routes/bootstrap');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/bootstrap', bootstrapRoutes);
app.use('/api/organizations', authenticateToken, organizationsRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/accounts', authenticateToken, accountsRoutes);
app.use('/api/contacts', authenticateToken, contactsRoutes);
app.use('/api/leads', authenticateToken, leadsRoutes);
app.use('/api/opportunities', authenticateToken, opportunitiesRoutes);
app.use('/api/activities', authenticateToken, activitiesRoutes);
app.use('/api/invoices', authenticateToken, invoicesRoutes);
app.use('/api/expenses', authenticateToken, expensesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});