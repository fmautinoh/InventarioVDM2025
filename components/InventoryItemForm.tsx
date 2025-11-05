
import React, { useState } from 'react';
import tursoService from '../services/tursoService';
import { ItemTemplate, Location, InventoryItem, ConservationState } from '../types';
import { Input, Select, Textarea, FormActions, DatalistInput } from './common';

interface InventoryItemFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    templates: ItemTemplate[];
    locations: Location[];
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ onSuccess, onCancel, templates, locations }) => {
    const [templateId, setTemplateId] = useState<string>('');
    const [locationId, setLocationId] = useState<string>('');
    const [quantities, setQuantities] = useState<Record<ConservationState, number>>({
        [ConservationState.Bueno]: 0,
        [ConservationState.Regular]: 0,
        [ConservationState.Malo]: 0,
    });
    const [situation, setSituation] = useState('');
    const [observations, setObservations] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = (state: ConservationState, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setQuantities(prev => ({ ...prev, [state]: numValue }));
        } else if (value === '') {
            setQuantities(prev => ({ ...prev, [state]: 0 }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateId) {
            setError('Please select an item template.');
            return;
        }
        const totalQuantity = Object.values(quantities).reduce((sum, count) => sum + count, 0);
        if (totalQuantity <= 0) {
            setError('Please enter a quantity for at least one conservation state.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await tursoService.createInventoryItems({
                templateId,
                locationId: locationId || undefined,
                quantities,
                situation,
                observations
            });
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
            <DatalistInput
                label="Item Template"
                id="templateId"
                selectedValue={templateId}
                onValueChange={setTemplateId}
                options={templates.map(t => ({ value: t.id, label: `${t.name} (${t.assetCode})` }))}
                placeholder="Type to search for a template..."
                required
            />
            <DatalistInput
                label="Location"
                id="locationId"
                selectedValue={locationId}
                onValueChange={setLocationId}
                options={locations.map(l => ({ value: l.id, label: l.name }))}
                placeholder="Type to search for a location (optional)..."
            />
            
            <fieldset className="border border-slate-300 dark:border-slate-600 p-4 rounded-md">
                <legend className="text-sm font-medium px-2">Quantities by Conservation State</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Bueno (Good)" type="number" min="0" value={quantities.Bueno} onChange={e => handleQuantityChange(ConservationState.Bueno, e.target.value)} />
                    <Input label="Regular" type="number" min="0" value={quantities.Regular} onChange={e => handleQuantityChange(ConservationState.Regular, e.target.value)} />
                    <Input label="Malo (Bad)" type="number" min="0" value={quantities.Malo} onChange={e => handleQuantityChange(ConservationState.Malo, e.target.value)} />
                </div>
            </fieldset>

            <Input label="Situation (e.g., In Use, Storage)" id="situation" value={situation} onChange={e => setSituation(e.target.value)} />
            <Textarea label="Observations" id="observations" value={observations} onChange={e => setObservations(e.target.value)} />
            
            <FormActions onCancel={onCancel} isSubmitting={isSubmitting} submitText="Add Items" />
        </form>
    );
};

export default InventoryItemForm;


interface InventoryItemEditFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData: InventoryItem;
    templates: ItemTemplate[];
    locations: Location[];
}

export const InventoryItemEditForm: React.FC<InventoryItemEditFormProps> = ({ onSuccess, onCancel, initialData, templates, locations }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await tursoService.updateInventoryItem(initialData.id, formData);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
            <DatalistInput
                label="Item Template"
                id="templateId"
                selectedValue={formData.templateId || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
                options={templates.map(t => ({ value: t.id, label: `${t.name} (${t.assetCode})` }))}
                placeholder="Type to search..."
                required
            />
            <DatalistInput
                label="Location"
                id="locationId"
                selectedValue={formData.locationId || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
                options={locations.map(l => ({ value: l.id, label: l.name }))}
                placeholder="Type to search (optional)..."
            />
            <Input label="Serial Number" id="serial" name="serial" value={formData.serial || ''} onChange={handleChange} />
            <Input label="Situation" id="situation" name="situation" value={formData.situation || ''} onChange={handleChange} />
            <Select label="Conservation State" id="conservationState" name="conservationState" value={formData.conservationState} onChange={handleChange} required>
                {Object.values(ConservationState).map(state => <option key={state} value={state}>{state}</option>)}
            </Select>
            <Textarea label="Observations" id="observations" name="observations" value={formData.observations || ''} onChange={handleChange} />
            <FormActions onCancel={onCancel} isSubmitting={isSubmitting}/>
        </form>
    )
}
