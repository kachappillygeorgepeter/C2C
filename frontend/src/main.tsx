import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Force light theme
document.documentElement.classList.remove('dark')
localStorage.removeItem('c2c_theme')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
