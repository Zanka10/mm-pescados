import { NavLink } from 'react-router-dom'

type Props = {
  onLogout?: () => void
}

export default function Sidebar({ onLogout }: Props) {
  const authUser = (() => {
    try {
      const raw = localStorage.getItem('mm-auth-user')
      return raw ? JSON.parse(raw) as { name?: string; email?: string; role?: string } : null
    } catch {
      return null
    }
  })()
  return (
    <aside className="dash-sidebar">
      <div className="sidebar-brand">
        <img src="/logo-mm-pescados.png" alt="Mm Pescados" className="sidebar-logo" />
      </div>
      <div className="sidebar-user">{authUser?.name ?? 'Usuário'}</div>
      <nav className="sidebar-nav">
        <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/dashboard">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 13h8V3H3zm0 8h8v-6H3zm10 0h8v-10h-8zm0-18v6h8V3z" />
            </svg>
          </span>
          Dashboard
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/produtos">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18v4H3zm0 6h18v6H3z" />
            </svg>
          </span>
          Produtos
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/pedidos">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21 6h-5V3H8v3H3v2h18zM5 20h14V8H5zm2-10h10v8H7z" />
            </svg>
          </span>
          Pedidos
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/clientes">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z" />
            </svg>
          </span>
          Clientes
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/usuarios">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm7 8v-1c0-2.76-3.58-5-8-5s-8 2.24-8 5v1z" />
            </svg>
          </span>
          Usuários
        </NavLink>

        <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/relatorios">
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 13h8V3H3zm10 8h8v-10h-8z" />
            </svg>
          </span>
          Relatórios
        </NavLink>
        <button className="nav-item" onClick={() => onLogout?.()}>
          <span className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
            </svg>
          </span>
          Sair
        </button>
      </nav>
      <div className="sidebar-footer">© 2024 MM Pescados</div>
    </aside>
  )
}
