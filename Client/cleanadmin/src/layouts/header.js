import '../App.css';
function Header() {
    return (
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
    );
}

export default Header;