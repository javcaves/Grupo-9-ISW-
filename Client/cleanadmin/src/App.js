import React, { useState } from 'react';
import './App.css';
import Header from './layouts/header.js';
import HomeSidebar from './pages/Admin/Home/home_sidebar.js';
import MainPersonal from './pages/Admin/Home/main_personal.js';
import MainActividades from './pages/Admin/Home/main_actividades.js';
import MainInventario from './pages/Admin/Home/main_inventario.js';

function App() {
  // Estado para controlar qué pestaña está activa
  const [tabActiva, setTabActiva] = useState('Personal');
  return (
    <div className="App">
      <Header />
      
      <div className='main-container'>
        <HomeSidebar />
        <div className='main'>
          <div className='supervisor'>
            <h2>Nombre Supervisor</h2>
          </div>
          {/* Contenedor de Tabs */}
          <div className='container-tabs'>
            <MainPersonal activa={tabActiva} setTabActiva={setTabActiva} />
            <MainActividades activa={tabActiva} setTabActiva={setTabActiva} />
            <MainInventario activa={tabActiva} setTabActiva={setTabActiva} />
          </div>

          {/* Contenido de la pestaña activa */}
          <div className='tab-content'>
            {tabActiva === 'Personal' && <p>Contenido de la tabla de Personal...</p>}
            {tabActiva === 'Actividades' && <p>Contenido de Actividades...</p>}
            {tabActiva === 'Inventario' && <p>Contenido de Inventario...</p>}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
