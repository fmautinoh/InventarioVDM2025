
import React from 'react';
import { ItemTemplate } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface ItemTemplatesListProps {
  templates: ItemTemplate[];
  onEdit: (template: ItemTemplate) => void;
  onDelete: (id: string) => void;
}

const ItemTemplatesList: React.FC<ItemTemplatesListProps> = ({ templates, onEdit, onDelete }) => {
  if (templates.length === 0) {
    return <div className="text-center py-8 text-slate-500">No item templates found. Create one to get started.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Asset Code</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {templates.map(template => (
            <tr key={template.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{template.assetCode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{template.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{template.brand || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{template.model || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(template)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"><PencilIcon/></button>
                <button onClick={() => onDelete(template.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTemplatesList;
