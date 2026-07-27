const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

const {
  getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense,
  getDashboardStats, getReport, getRecurringExpenses,
  getDailyCashClosing, createDailyCashClosing
} = require('../controllers/expenseController');

const {
  getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
  getSubcategoriesByCategoryId, addSubcategory, updateSubcategory, deleteSubcategory,
  seedDefaultCategories
} = require('../controllers/expenseCategoryController');

const {
  getAllVendors, createVendor, updateVendor, deleteVendor
} = require('../controllers/expenseVendorController');

// ─── Dashboard & Reports ─────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);
router.get('/reports', getReport);

// ─── Expenses (Basic) ──────────────────────────────────────────────────────────
router.route('/')
  .get(getAllExpenses)
  .post(upload.single('receipt'), createExpense);

// ─── Recurring ────────────────────────────────────────────────────────────────
router.get('/recurring/list', getRecurringExpenses);

// ─── Daily Cash Closing ───────────────────────────────────────────────────────
router.route('/cash-closing')
  .get(getDailyCashClosing)
  .post(createDailyCashClosing);

// ─── Categories ───────────────────────────────────────────────────────────────
router.post('/categories/seed', seedDefaultCategories);
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);
router.route('/categories/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

// ─── Subcategories ────────────────────────────────────────────────────────────
router.route('/categories/:catId/subcategories')
  .get(getSubcategoriesByCategoryId)
  .post(addSubcategory);
router.route('/categories/:catId/subcategories/:subId')
  .put(updateSubcategory)
  .delete(deleteSubcategory);

// ─── Vendors ──────────────────────────────────────────────────────────────────
router.route('/vendors')
  .get(getAllVendors)
  .post(createVendor);
router.route('/vendors/:id')
  .put(updateVendor)
  .delete(deleteVendor);

// ─── Expense By ID (Keep at the bottom to avoid catching other routes like /categories) ──
router.route('/:id')
  .get(getExpenseById)
  .put(upload.single('receipt'), updateExpense)
  .delete(deleteExpense);

module.exports = router;
