
import React, { useState } from 'react';
import tursoService from '../services/tursoService';
import { ItemTemplate } from '../types';
import { Input, Textarea, FormActions } from './common';

interface ItemTemplateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: ItemTemplate | null;
}

const ItemTemplateForm: React.FC<ItemTemplateFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<ItemTemplate, 'id'>>({
    assetCode: initialData?.assetCode || '',
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    type: initialData?.type || '',
    color: initialData?.color || '',
    dimensions: initialData?.dimensions || '',
    other: initialData?.other || '',
    origin: initialData?.origin || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (initialData?.id) {
        await tursoService.updateItemTemplate(initialData.id, formData);
      } else {
        await tursoService.createItemTemplate(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Asset Code" id="assetCode" name="assetCode" value={formData.assetCode} onChange={handleChange} required />
        <Input label="Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
        <Input label="Brand" id="brand" name="brand" value={formData.brand} onChange={handleChange} />
        <Input label="Model" id="model" name="model" value={formData.model} onChange={handleChange} />
        <Input label="Type" id="type" name="type" value={formData.type} onChange={handleChange} />
        <Input label="Color" id="color" name="color" value={formData.color} onChange={handleChange} />
        <Input label="Dimensions" id="dimensions" name="dimensions" value={formData.dimensions} onChange={handleChange} />
        <Input label="Origin" id="origin" name="origin" value={formData.origin} onChange={handleChange} />
      </div>
      <Textarea label="Other" id="other" name="other" value={formData.other} onChange={handleChange} />
      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
    </form>
  );
};

export default ItemTemplateForm;
