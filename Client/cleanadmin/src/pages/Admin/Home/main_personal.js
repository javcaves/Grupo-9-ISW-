import React from 'react';
import '../../../App.css';

function MainPersonal({ activa, setTabActiva }) {
    return (
        <button 
              className={activa === 'Personal' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Personal')}>
              Registro Personal
        </button>

    );
}

export default MainPersonal