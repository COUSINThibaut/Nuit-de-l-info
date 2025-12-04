import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="*" element={
        <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-mono">
          404 - Page non trouvée
        </div>
      } />
    </Routes>
  );
}

export default App;