// components/equipment/EquipmentManager.tsx
// Equipment management component

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Search,
  Plus,
  QrCode
} from 'lucide-react';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { Equipment } from '@/types';
import { EquipmentDetailsModal } from '@/components/equipment/EquipmentDetailsModal';

export default function EquipmentManager() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const { emit } = useWebSocket({
    onEquipmentStatusChanged: (data) => {
      setEquipment(prev => 
        prev.map(item => 
          item.id === data.equipmentId 
            ? { ...item, status: data.status }
            : item
        )
      );
    },
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipment');
      if (response.ok) {
        const data = await response.json();
        setEquipment(data.equipment);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEquipmentStatus = async (equipmentId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        // Emit WebSocket event for real-time updates
        emit('equipment:update', { equipmentId, status });
        
        setEquipment(prev =>
          prev.map(item =>
            item.id === equipmentId ? { ...item, status: status as Equipment['status'] } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update equipment status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <Settings className="h-5 w-5 text-yellow-500" />;
      case 'out_of_order':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'retired':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_order': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getConditionColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const maintenanceOverdue = equipment.filter(item => 
    new Date(item.nextMaintenanceDate) < new Date() && item.status === 'operational'
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600">Monitor and maintain gym equipment</p>
        </div>
        <Button onClick={() => setShowMaintenanceModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Maintenance Alerts */}
      {maintenanceOverdue.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Maintenance Overdue ({maintenanceOverdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {maintenanceOverdue.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-red-700">{item.name} - {item.brand} {item.model}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateEquipmentStatus(item.id, 'maintenance')}
                  >
                    Mark for Maintenance
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search equipment..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_order">Out of Order</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-gray-600">{item.brand} {item.model}</p>
                  <p className="text-sm text-gray-500">SN: {item.serialNumber}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusIcon(item.status)}
                  <QrCode className="h-4 w-4 text-gray-400 cursor-pointer">
                    <title>QR Code</title>
                  </QrCode>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Condition:</span>
                  <span className={`font-medium ${getConditionColor(item.conditionRating)}`}>
                    {item.conditionRating}/5
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm">{item.area?.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm">{item.category?.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Maintenance:</span>
                  <span className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEquipment(item)}
                    >
                      View Details
                    </Button>
                    <select
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      value={item.status}
                      onChange={(e) => updateEquipmentStatus(item.id, e.target.value)}
                    >
                      <option value="operational">Operational</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="out_of_order">Out of Order</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equipment Details Modal */}
      {selectedEquipment && (
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onUpdate={fetchEquipment}
        />
      )}
    </div>
  );
}