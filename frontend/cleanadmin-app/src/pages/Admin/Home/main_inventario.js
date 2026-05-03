import React from "react";
import '../../../App.css';

function MainInventario({ activa, setTabActiva }) {
    return (
        <button type="button"
              className={activa === 'Inventario' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Inventario')}>
              Inventario
        </button>
    );
}

export default MainInventario;