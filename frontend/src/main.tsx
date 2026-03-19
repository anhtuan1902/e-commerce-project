import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AppRouter from './routes/AppRouter';
import ThemeProvider from './components/layout/ThemeProvider';
import { store } from './store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        {/* <ThemeProvider> */}
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        {/* </ThemeProvider> */}
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
