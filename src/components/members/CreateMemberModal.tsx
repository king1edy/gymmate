import React from 'react';
import { ModalProps } from '@/types';


export default function CreateMemberModal({ onClose, onSuccess }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
        <h2 className="text-lg font-semibold mb-4">Create Member</h2>
        {/* Add form fields here as needed */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onSuccess}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 