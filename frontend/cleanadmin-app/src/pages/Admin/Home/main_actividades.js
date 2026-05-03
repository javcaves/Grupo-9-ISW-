
import '../../../App.css';

function MainActividades({ activa, setTabActiva }) {
    return (
         <button type='button'
              className={activa === 'Actividades' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Actividades')}>
              Actividades
         </button>
    );
}

export function ContentActividades() {
    return (
        <div className="view-actividades">
            <div className="activity-row">
                <span>Aseo de Baño</span>
                <span>John Perez</span>
                <span className="status-pending">Pendiente</span>
            </div>
            {/* Estructura basada en la página 10 del PDF */}
        </div>
    );
}
export default MainActividades;