
import React from 'react';
import { InventoryItem, ItemTemplate, Location } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface InventoryListProps {
  items: InventoryItem[];
  templates: ItemTemplate[];
  locations: Location[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, templates, locations, onEdit, onDelete }) => {
  const getTemplateName = (id: string) => templates.find(t => t.id === id)?.name || 'Unknown';
  const getLocationName = (id?: string) => locations.find(l => l.id === id)?.name || 'N/A';
  
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  if (items.length === 0) {
    return <div className="text-center py-8 text-slate-500">No inventory items found. Add one to get started.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pos</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serial</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">State</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {sortedItems.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{getTemplateName(item.templateId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{getLocationName(item.locationId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.serial || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.conservationState === 'Bueno' ? 'bg-green-100 text-green-800' : item.conservationState === 'Regular' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {item.conservationState}
                 </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"><PencilIcon/></button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;
