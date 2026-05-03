import React, { useState } from 'react';
import './App.css';

function App() {
  // Estado para controlar qué pestaña está activa
  const [tabActiva, setTabActiva] = useState('Personal');
  return (
    <div className="App">
      <header className="App-header">
        <div className='logo'>
          <h3>CleanAdmin</h3>
        </div>
        <div className='vistas'>
          <button>home</button>
          <button>stadistics</button>
        </div>
        <div className='config'>
          <button>alerts</button>
          <button>settings</button>
        </div>
      </header>
      <div className='main-container'>
        <div className='sidebar'>
          <div className='foto-perfil'>
            <img src="path/to/profile/image.jpg" alt="Profile"></img>
          </div>
          <div className='hora'>
            <h3>Hora</h3>
          </div>
          <div className='fecha'>
            <h3>Fecha</h3>
          </div>
          <div className='nombre-proyecto'>
            <h3>Nombre del Proyecto</h3>
          </div>
          <div className='token'>
            <button>Token</button>
          </div>
        </div>
        <div className='main'>
          <div className='supervisor'>
            <h2>Nombre Supervisor</h2>
          </div>
          {/* Contenedor de Tabs */}
          <div className='container-tabs'>
            <button 
              className={tabActiva === 'Personal' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Personal')}
            >
              Registro Personal
            </button>
            <button 
              className={tabActiva === 'Actividades' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Actividades')}
            >
              Actividades
            </button>
            <button 
              className={tabActiva === 'Inventario' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Inventario')}
            >
              Inventario
            </button>
          </div>
          {/* Contenido dinámico según la pestaña */}
          <div className='tab-content'>
            {tabActiva === 'Personal' && <div>aquí va la tabla de personal...</div>}
            {tabActiva === 'Actividades' && <div>aquí van las actividades...</div>}
            {tabActiva === 'Inventario' && <div>aquí va el inventario...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
