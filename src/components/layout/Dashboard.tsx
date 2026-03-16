import { Route, Routes } from 'react-router-dom'
import '../../assets/styles/Dashboard.css'
import Sidebar from './Sidebar'
import Clients from '../../pages/admin/Clients'
import DashboardHome from '../../pages/admin/DashboardHome'
import Orders from '../../pages/admin/Orders'
import Users from '../../pages/admin/Users'
import Reports from '../../pages/admin/Reports'
import Products from '../../pages/admin/Products'
import { storageService } from '../../services/storage.service'

type Props = {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: Props) {
  return (
    <div className="dash">
      <Sidebar onLogout={onLogout} />

      <main className="dash-main">
        <Routes>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/relatorios" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}
