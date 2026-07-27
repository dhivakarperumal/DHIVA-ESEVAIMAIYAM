import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './Componets/Home/Home.jsx'
import Login from './Componets/Auth/Login.jsx'
import Register from './Componets/Components/Register.jsx'
import PrivateRoute from './PrivateRouter/PrivateRouter.jsx'
import EmployeeDashboard from './Employees/EmployeeDashboard.jsx'
import AdminDashboard from './Admin/AdminDashboard.jsx'
import AdminLayout from './Admin/Adminpanel.jsx'
import UserManagement from './Admin/UserManagement.jsx'
import ServiceManagement from './Admin/ServiceManagement.jsx'
import ServiceCategories from './Admin/ServiceCategories.jsx'
import RequiredDocuments from './Admin/RequiredDocuments.jsx'
import ServiceCharges from './Admin/ServiceCharges.jsx'
import ExpenseDashboard from './Admin/ExpenseDashboard.jsx'
import AllExpenses from './Admin/AllExpenses.jsx'
import AddExpense from './Admin/AddExpense.jsx'
import ExpenseCategories from './Admin/ExpenseCategories.jsx'
import RecurringExpenses from './Admin/RecurringExpenses.jsx'
import ExpenseVendors from './Admin/ExpenseVendors.jsx'
import ExpenseReports from './Admin/ExpenseReports.jsx'
import DailyCashClosing from './Admin/DailyCashClosing.jsx'
import EmployeeLayout from './Employees/EmployeePanel.jsx'
import { AuthProvider } from './PrivateRouter/AuthContext.jsx'
import { StoreProvider } from './PrivateRouter/StoreContext.jsx'

// Normalize URLs when using hash routing so legacy or direct /admin paths map to /#/admin
const { pathname, search, hash } = window.location
if (pathname !== '/' && pathname !== '' && !pathname.startsWith('/#')) {
  const normalizedPath = pathname.replace(/^\/+/g, '').replace(/\/+$/, '')
  const normalizedHash = hash && hash.startsWith('#/') ? hash : `#/${normalizedPath}`
  window.history.replaceState(null, '', `/${search}${normalizedHash}`)
}

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      
      {
        path: 'admin',
        element: (
          <PrivateRoute allowedRoles={["Super Admin", "Admin"]}>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'user-management',
            element: <UserManagement />,
          },
          {
            path: 'service-management/all',
            element: <ServiceManagement />,
          },
          {
            path: 'service-management/add',
            element: <ServiceManagement />,
          },
          {
            path: 'service-management/categories',
            element: <ServiceCategories />,
          },
          {
            path: 'service-management/documents',
            element: <RequiredDocuments />,
          },
          {
            path: 'service-management/charges',
            element: <ServiceCharges />,
          },
          // ── Expense Management ────────────────────────────────────────
          {
            path: 'expense-management/dashboard',
            element: <ExpenseDashboard />,
          },
          {
            path: 'expense-management/all',
            element: <AllExpenses />,
          },
          {
            path: 'expense-management/add',
            element: <AddExpense />,
          },
          {
            path: 'expense-management/edit/:id',
            element: <AddExpense />,
          },
          {
            path: 'expense-management/categories',
            element: <ExpenseCategories />,
          },
          {
            path: 'expense-management/recurring',
            element: <RecurringExpenses />,
          },
          {
            path: 'expense-management/vendors',
            element: <ExpenseVendors />,
          },
          {
            path: 'expense-management/reports',
            element: <ExpenseReports />,
          },
          {
            path: 'expense-management/cash-closing',
            element: <DailyCashClosing />,
          },
        ],
      },
      {
        path: 'employee',
        element: (
          <PrivateRoute allowedRoles={["Manager", "Staff", "Employee"]}>
            <EmployeeLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <EmployeeDashboard />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </AuthProvider>
  </StrictMode>,
)
