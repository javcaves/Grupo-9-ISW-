import React, { useState } from 'react'; 
import { ADMIN_CONFIG } from '../../../data/adminConfig'; 
import LayoutContent from '../../../layouts/LayoutContent';
import Modal from '../../../components/Modal'; 

export default function InventariosView() {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const handleOpenItemModal = () => setIsItemModalOpen(true);
  const handleCloseItemModal = () => setIsItemModalOpen(false);

  const customActions = (
    <button 
      onClick={handleOpenItemModal}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
    >
      Crear ítem
    </button>
  );

  return (
    <LayoutContent 
      header={{ title: "Inventario", subtitle: "Gestión de ítems del proyecto" }}
      actions={customActions} 
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Ítem</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Control</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-gray-50">
              <td className="p-4 font-bold text-gray-800">Fregadora Industrial</td>
              <td className="p-4">Maquinaria</td>
              <td className="p-4">Préstamo</td>
              <td className="p-4">
                <div className="font-bold">2</div>
                <div className="text-xs text-gray-400">Min: 1</div>
              </td>
              <td className="p-4">
                <span className="text-green-600 font-semibold text-xs">● Disponible</span>
              </td>
              <td className="p-4 text-right">
                <button className="text-indigo-600 hover:underline">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal isOpen={isItemModalOpen} onClose={handleCloseItemModal}>
        <div className="p-6 w-[400px]">
          <h2 className="text-xl font-bold mb-4">Crear Nuevo Ítem</h2>
          <form className="flex flex-col gap-3">
             <input type="text" placeholder="Nombre del ítem" className="border p-2 rounded" />
             <input type="text" placeholder="Tipo" className="border p-2 rounded" />
             <input type="text" placeholder="Control" className="border p-2 rounded" />
             <button type="button" onClick={handleCloseItemModal} className="bg-indigo-600 text-white p-2 rounded mt-2">
               Guardar
             </button>
          </form>
        </div>
      </Modal>
    </LayoutContent>
  );
}