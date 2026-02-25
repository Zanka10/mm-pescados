import { Route, Routes } from 'react-router-dom'
import './Dashboard.css'
import Sidebar from './Sidebar'
import Clients from '../pages/Clients'
import DashboardHome from '../pages/DashboardHome'
import Orders from '../pages/Orders'
import Users from '../pages/Users'
import Stock from '../pages/Stock'
import Reports from '../pages/Reports'

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
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/estoque" element={<Stock />} />
          <Route path="/relatorios" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}
