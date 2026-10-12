import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import App from './App';
import { isSupabaseConfigured } from './services/supabaseClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isSupabaseConfigured ? <App /> : (
      <main className="min-h-screen flex items-center justify-center bg-secondary-50 p-6">
        <section className="max-w-lg rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-secondary-900">SafeRoute Connect</h1>
          <p className="mt-4 text-secondary-700">The site is waiting for its connection settings. Please try again once setup is complete.</p>
          <p className="mt-4 text-sm text-secondary-500">Site owner: add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to the deployment environment, then redeploy.</p>
        </section>
      </main>
    )}
  </React.StrictMode>
);
