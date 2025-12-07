import { render } from 'preact'
import { AuthProvider } from '../auth/AuthContext'
import { NewTabPage } from './NewTabPage'
import '../index.css'

render(
  <AuthProvider>
    <NewTabPage />
  </AuthProvider>,
  document.getElementById('app')!
)
