
import '../../../App.css';

function MainActividades({ activa, setTabActiva }) {
    return (
         <button 
              className={activa === 'Actividades' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Actividades')}>
              Actividades
         </button>
    );
}

export default MainActividades;