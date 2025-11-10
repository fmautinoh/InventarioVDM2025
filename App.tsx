
import React, { useState, useEffect, useCallback } from 'react';
import tursoService from './services/tursoService';
import { ItemTemplate, Location, InventoryItem, View, ConservationState } from './types';
import { PlusIcon, DownloadIcon } from './components/icons';
import Modal from './components/Modal';

// Define forms inside their own files and import them
import ItemTemplateForm from './components/ItemTemplateForm';
import LocationForm from './components/LocationForm';
import InventoryItemForm, { InventoryItemEditForm } from './components/InventoryItemForm';
import InventoryList from './components/InventoryList';
import ItemTemplatesList from './components/ItemTemplatesList';
import LocationsList from './components/LocationsList';

// Type for XLSX, which is loaded from a CDN
declare var XLSX: any;


const App: React.FC = () => {
    const [view, setView] = useState<View>('inventory');
    const [templates, setTemplates] = useState<ItemTemplate[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemTemplate | Location | InventoryItem | null>(null);
    const [modalType, setModalType] = useState<'template' | 'location' | 'inventory' | 'inventory-edit' | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [templatesData, locationsData, inventoryData] = await Promise.all([
                tursoService.getItemTemplates(),
                tursoService.getLocations(),
                tursoService.getInventoryItems()
            ]);
            setTemplates(templatesData);
            setLocations(locationsData);
            setInventory(inventoryData);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (type: 'template' | 'location' | 'inventory', item: ItemTemplate | Location | InventoryItem | null = null) => {
        if(type === 'inventory' && item) {
            setModalType('inventory-edit');
        } else {
            setModalType(type);
        }
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setModalType(null);
    };

    const handleSuccess = () => {
        fetchData();
        handleCloseModal();
    };

    const handleDelete = async (type: View, id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            switch (type) {
                case 'templates':
                    await tursoService.deleteItemTemplate(id);
                    break;
                case 'locations':
                    await tursoService.deleteLocation(id);
                    break;
                case 'inventory':
                    await tursoService.deleteInventoryItem(id);
                    break;
            }
            fetchData();
        } catch (err) {
            setError(`Failed to delete item. ${err instanceof Error ? err.message : ''}`);
        }
    };
    
    const handleExportToExcel = () => {
        const dataToExport = inventory.map(item => {
            const template = templates.find(t => t.id === item.templateId);
            const location = locations.find(l => l.id === item.locationId);
            return {
                'Position': item.position,
                'Asset Code': template?.assetCode || 'N/A',
                'Item Name': template?.name || 'N/A',
                'Brand': template?.brand || '',
                'Model': template?.model || '',
                'Location': location?.name || 'N/A',
                'Serial Number': item.serial || '',
                'Situation': item.situation || '',
                'Conservation State': item.conservationState,
                'Observations': item.observations || '',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
        XLSX.writeFile(workbook, 'InventoryReport.xlsx');
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8">Loading...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        switch (view) {
            case 'inventory':
                return <InventoryList items={inventory} templates={templates} locations={locations} onEdit={(item) => handleOpenModal('inventory', item)} onDelete={(id) => handleDelete('inventory', id)} />;
            case 'templates':
                return <ItemTemplatesList templates={templates} onEdit={(template) => handleOpenModal('template', template)} onDelete={(id) => handleDelete('templates', id)} />;
            case 'locations':
                return <LocationsList locations={locations} onEdit={(location) => handleOpenModal('location', location)} onDelete={(id) => handleDelete('locations', id)} />;
            default:
                return null;
        }
    };

    const getModalContent = () => {
        switch (modalType) {
            case 'template':
                return <ItemTemplateForm onSuccess={handleSuccess} onCancel={handleCloseModal} initialData={editingItem as ItemTemplate | null} />;
            case 'location':
                return <LocationForm onSuccess={handleSuccess} onCancel={handleCloseModal} initialData={editingItem as Location | null} />;
            case 'inventory':
                 return <InventoryItemForm onSuccess={handleSuccess} onCancel={handleCloseModal} templates={templates} locations={locations} />;
            case 'inventory-edit':
                return <InventoryItemEditForm onSuccess={handleSuccess} onCancel={handleCloseModal} initialData={editingItem as InventoryItem} templates={templates} locations={locations}/>
            default:
                return null;
        }
    };
    
    const getModalTitle = () => {
        switch (modalType) {
            case 'template': return editingItem ? 'Edit Item Template' : 'New Item Template';
            case 'location': return editingItem ? 'Edit Location' : 'New Location';
            case 'inventory': return 'Add Inventory Items';
            case 'inventory-edit': return 'Edit Inventory Item';
            default: return '';
        }
    };

    const getButtonText = () => {
        switch (view) {
            case 'inventory': return 'Add Inventory Item';
            case 'templates': return 'New Template';
            case 'locations': return 'New Location';
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">VDM INVENTARIO</h1>
                    <nav className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={() => setView('inventory')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Inventory</button>
                        <button onClick={() => setView('templates')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Templates</button>
                        <button onClick={() => setView('locations')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'locations' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Locations</button>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold capitalize">{view}</h2>
                        <div className="flex space-x-2">
                            {view === 'inventory' && (
                                <button onClick={handleExportToExcel} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-150">
                                    <DownloadIcon />
                                    Export
                                </button>
                            )}
                            {/* FIX: Mapped `view` state to the correct singular form required by `handleOpenModal`. The `view` can be 'templates' or 'locations' (plural), but the modal handler expects 'template' or 'location' (singular). */}
                            <button onClick={() => handleOpenModal(view === 'templates' ? 'template' : view === 'locations' ? 'location' : view)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150">
                                <PlusIcon />
                                <span className="ml-2 hidden sm:inline">{getButtonText()}</span>
                            </button>
                        </div>
                    </div>
                    {renderContent()}
                </div>
            </main>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()}>
                {getModalContent()}
            </Modal>
        </div>
    );
};

export default App;
