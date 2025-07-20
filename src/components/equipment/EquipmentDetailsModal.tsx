// src/components/equipment/EquipmentDetailsModal.tsx
import React from 'react';
import type { Equipment } from '@/types';

interface EquipmentDetailsModalProps {
  equipment: Equipment;
  onClose: () => void;
  onUpdate: () => void;
}

export const EquipmentDetailsModal: React.FC<EquipmentDetailsModalProps> = ({ equipment, onClose, onUpdate }) => (
  <div>
    <h2>Equipment Details</h2>
    <p>{equipment.name}</p>
    <button onClick={onClose}>Close</button>
    <button onClick={onUpdate}>Update</button>
  </div>
);