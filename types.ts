
export interface ItemTemplate {
  id: string;
  assetCode: string;
  name: string;
  brand?: string;
  model?: string;
  type?: string;
  color?: string;
  dimensions?: string;
  other?: string;
  origin?: string;
}

export interface Location {
  id: string;
  name:string;
}

export enum ConservationState {
  Bueno = 'Bueno',
  Regular = 'Regular',
  Malo = 'Malo',
}

export interface InventoryItem {
  id: string;
  position: number;
  templateId: string;
  locationId?: string;
  serial?: string;
  situation?: string;
  conservationState: ConservationState;
  observations?: string;
}

// For UI state management
export type View = 'inventory' | 'templates' | 'locations';
