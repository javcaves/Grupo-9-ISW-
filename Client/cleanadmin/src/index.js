import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

//para que es este index.js?
//Este index.js es el punto de entrada de la aplicación React. Es el archivo que se ejecuta primero cuando se inicia la aplicación. En este archivo, se importa el componente principal App y se renderiza dentro del elemento con id 'root' en el HTML. También se importa un archivo de estilos CSS y una función para medir el rendimiento de la aplicación.