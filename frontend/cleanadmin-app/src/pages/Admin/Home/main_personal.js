import React from 'react';
import '../../../App.css';

function MainPersonal({ activa, setTabActiva }) {
    return (
        <button type='button' 
              className={activa === 'Personal' ? 'tab active' : 'tab'} 
              onClick={() => setTabActiva('Personal')}>
              Registro Personal
        </button>

    );
}

export function ContentPersonal() {
    return (
        <div className="view-personal">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Horario (Entrada/Colación/Salida)</th>
                        <th>Checklist</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jose Perez</td>
                        <td><span className="time">08:00</span> <span className="time">12:00</span> <span className="time">16:00</span></td>
                        <td><input type="checkbox" checked readOnly /></td>
                        <td><button>edit</button> <button>delete</button></td>
                    </tr>
                    {/* Más filas según el PDF */}
                </tbody>
            </table>
        </div>
    );
}

export default MainPersonal