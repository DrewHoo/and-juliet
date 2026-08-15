import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// The markup is already in the HTML — scripts/prerender.mjs bakes it in at
// build time so crawlers (and anyone with JS off) get the whole list without
// executing anything. Hydrate onto it rather than throwing it away.
hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
