import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AppRouter from './routes/AppRouter';
import { store } from './store';
import { AuthProvider } from './providers/AuthProvider';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      {/* <ThemeProvider> */}
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
      {/* </ThemeProvider> */}
    </Provider>
  </GoogleOAuthProvider>,
  // </StrictMode>,
);
