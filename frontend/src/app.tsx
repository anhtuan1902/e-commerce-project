import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/providers';
import AppRouter from './app/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

if (import.meta.env.MODE  === 'development') {
  import('react-scan').then(({ scan }) => {
    scan({ enabled: true });
  });
}


export default function App() {
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProviders>
            <AppRouter />
          </AppProviders>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
