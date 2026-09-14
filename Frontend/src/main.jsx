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
import ServiceManagement from './Admin/ServicesMangement/ServiceManagement.jsx'
import AddService from './Admin/ServicesMangement/AddService.jsx'
import ServiceCategories from './Admin/ServicesMangement/ServiceCategories.jsx'
import RequiredDocuments from './Admin/ApplicationMangement/RequiredDocuments.jsx'
import ServiceCharges from './Admin/ServicesMangement/ServiceChargesPage.jsx'
import ExpenseDashboard from './Admin/ExpenseManagement/ExpenseDashboard.jsx'
import AllExpenses from './Admin/ExpenseManagement/AllExpenses.jsx'
import AddExpense from './Admin/ExpenseManagement/AddExpense.jsx'
import ExpenseCategories from './Admin/ExpenseManagement/ExpenseCategories.jsx'
import RecurringExpenses from './Admin/ExpenseManagement/RecurringExpenses.jsx'
import ExpenseVendors from './Admin/ExpenseManagement/ExpenseVendors.jsx'
import ExpenseReports from './Admin/ExpenseManagement/ExpenseReports.jsx'
import DailyCashClosing from './Admin/ExpenseManagement/DailyCashClosing.jsx'
import Applications from './Admin/ApplicationMangement/Applications.jsx'
import EquipmentManagement from './Admin/EquipmentManagement.jsx'
import Certificates from './Admin/Certificates.jsx'
import Payments from './Admin/Payments.jsx'
import Reports from './Admin/Reports.jsx'
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
            path: 'applications',
            element: <Applications />,
          },
          {
            path: 'equipment-management',
            element: <EquipmentManagement />,
          },
          {
            path: 'certificates',
            element: <Certificates />,
          },
          {
            path: 'payments',
            element: <Payments />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'service-management/all',
            element: <ServiceManagement />,
          },
          {
            path: 'service-management/add',
            element: <AddService />,
          },
          {
            path: 'service-management/edit/:id',
            element: <AddService />,
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
