import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './assets/styles/App.css'
import Dashboard from './components/layout/Dashboard'
import Login from './components/admin/Login'
import Shop from './pages/shop/Shop'
import { storageService } from './services/storage.service'
import type { User } from './types'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(() => storageService.isAuthenticated())
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Informe email e senha')
      return
    }
    try {
      const raw = localStorage.getItem('mm-users')
      let users = raw ? (JSON.parse(raw) as User[]) : []
      
      if (users.length === 0) {
        users = [
          { name: 'Gabriel Rosa', email: 'gabriel@mm.com.br', password: '********', role: 'Colaborador', status: 'Ativo' },
          { name: 'Ana Martins', email: 'ana@mm.com.br', password: '********', role: 'Administrador', status: 'Ativo' },
        ]
        localStorage.setItem('mm-users', JSON.stringify(users))
      }

      const email = username.trim().toLowerCase()
      const found = users.find((u) => u.email?.toLowerCase() === email && u.password === password && u.status === 'Ativo')
      if (!found) {
        setError('Usuário ou senha inválidos')
        return
      }
      setLoggedIn(true)
      storageService.setAuth(true, { name: found.name, email: found.email, role: found.role })
    } catch {
      setError('Falha ao validar login')
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/loja" element={<Shop />} />
        
        {/* Rotas de Autenticação */}
        {!loggedIn ? (
          <>
            <Route path="/login" element={
              <Login
                username={username}
                password={password}
                error={error}
                showPassword={showPassword}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
                onSubmit={handleSubmit}
              />
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <Dashboard
                  onLogout={() => {
                    storageService.logout()
                    setLoggedIn(false)
                  }}
                />
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
