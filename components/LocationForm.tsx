
import React, { useState } from 'react';
import tursoService from '../services/tursoService';
import { Location } from '../types';
import { Input, FormActions } from './common';

interface LocationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Location | null;
}

const LocationForm: React.FC<LocationFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (initialData?.id) {
        await tursoService.updateLocation(initialData.id, { name });
      } else {
        await tursoService.createLocation({ name });
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
       <Input label="Location Name" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
       <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
    </form>
  );
};

export default LocationForm;
