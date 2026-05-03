import '../../../App.css';


function HomeSidebar() {
    return (
        <div className='HomeSidebar'>
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
    );
}

export default HomeSidebar;