import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import AudioDisplayer from "./CapGemini/AudioUploader";
import LegalNotice from "./pages/LegalNotice";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/AudioDisplayer" element={<AudioDisplayer />} />
      <Route path="/LegalNotice" element={<LegalNotice />} />
      
      <Route path="*" element={
        <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-mono">
          404 - Page non trouvée
        </div>
      } />
    </Routes>
  );
}

export default App;