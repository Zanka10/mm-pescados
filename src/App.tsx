import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function App() {
  const AUTH_KEY = 'mm-auth-logged'
  const AUTH_USER_KEY = 'mm-auth-user'
  const USERS_KEY = 'mm-users'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Informe email e senha')
      return
    }
    try {
      const raw = localStorage.getItem(USERS_KEY)
      let users = raw ? (JSON.parse(raw) as Array<{ email: string; password: string; name: string; role?: string; status?: string }>) : []
      
      // Se não houver usuários no localStorage, usa os padrões para garantir o login funcional
      if (users.length === 0) {
        users = [
          { name: 'Gabriel Rosa', email: 'gabriel@mm.com.br', password: '********', role: 'Colaborador', status: 'Ativo' },
          { name: 'Ana Martins', email: 'ana@mm.com.br', password: '********', role: 'Administrador', status: 'Ativo' },
        ]
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
      }

      const email = username.trim().toLowerCase()
      const found = users.find((u) => u.email?.toLowerCase() === email && u.password === password && (u.status ?? 'Ativo') === 'Ativo')
      if (!found) {
        setError('Usuário ou senha inválidos')
        return
      }
      setLoggedIn(true)
      localStorage.setItem(AUTH_KEY, 'true')
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ name: found.name, email: found.email, role: found.role ?? 'Colaborador' }))
    } catch {
      setError('Falha ao validar login')
    }
  }

  return (
    <BrowserRouter>
      {loggedIn ? (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <Dashboard
                onLogout={() => {
                  localStorage.removeItem(AUTH_KEY)
                  localStorage.removeItem(AUTH_USER_KEY)
                  setLoggedIn(false)
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
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
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
