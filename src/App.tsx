import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function App() {
  const VALID_USERNAME = 'bmm'
  const VALID_PASSWORD = 'pescados'
  const AUTH_KEY = 'mm-auth-logged'

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
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      setError('Usuário ou senha inválidos')
      return
    }
    setLoggedIn(true)
    localStorage.setItem(AUTH_KEY, 'true')
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
