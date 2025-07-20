// components/health/HealthMetricsForm.tsx
// Health metrics tracking form

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface HealthMetricsFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function HealthMetricsForm({ onSubmit, loading }: HealthMetricsFormProps) {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bodyFatPercentage: '',
    muscleMass: '',
    restingHeartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      bicep_left: '',
      bicep_right: '',
      thigh_left: '',
      thigh_right: '',
    },
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty values
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key === 'measurements') {
        const cleanMeasurements = Object.entries(value).reduce((measAcc, [measKey, measValue]) => {
          if (measValue && measValue.trim() !== '') {
            measAcc[measKey] = parseFloat(measValue);
          }
          return measAcc;
        }, {} as any);
        
        if (Object.keys(cleanMeasurements).length > 0) {
          acc[key] = cleanMeasurements;
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        acc[key] = key === 'notes' ? value : parseFloat(value);
      }
      return acc;
    }, {} as any);

    await onSubmit(cleanData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMeasurement = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Health Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                placeholder="Enter weight"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => updateFormData('height', e.target.value)}
                placeholder="Enter height"
              />
            </div>
            <div>
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                value={formData.bodyFatPercentage}
                onChange={(e) => updateFormData('bodyFatPercentage', e.target.value)}
                placeholder="Enter body fat percentage"
              />
            </div>
            <div>
              <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
              <Input
                id="muscleMass"
                type="number"
                step="0.1"
                value={formData.muscleMass}
                onChange={(e) => updateFormData('muscleMass', e.target.value)}
                placeholder="Enter muscle mass"
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="restingHeartRate">Resting Heart Rate (bpm)</Label>
              <Input
                id="restingHeartRate"
                type="number"
                value={formData.restingHeartRate}
                onChange={(e) => updateFormData('restingHeartRate', e.target.value)}
                placeholder="Enter heart rate"
              />
            </div>
            <div>
              <Label htmlFor="systolic">Blood Pressure Systolic</Label>
              <Input
                id="systolic"
                type="number"
                value={formData.bloodPressureSystolic}
                onChange={(e) => updateFormData('bloodPressureSystolic', e.target.value)}
                placeholder="e.g., 120"
              />
            </div>
            <div>
              <Label htmlFor="diastolic">Blood Pressure Diastolic</Label>
              <Input
                id="diastolic"
                type="number"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => updateFormData('bloodPressureDiastolic', e.target.value)}
                placeholder="e.g., 80"
              />
            </div>
          </div>

          {/* Body Measurements */}
          <div>
            <h4 className="text-lg font-medium mb-4">Body Measurements (cm)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="chest">Chest</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={formData.measurements.chest}
                  onChange={(e) => updateMeasurement('chest', e.target.value)}
                  placeholder="Chest"
                />
              </div>
              <div>
                <Label htmlFor="waist">Waist</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={formData.measurements.waist}
                  onChange={(e) => updateMeasurement('waist', e.target.value)}
                  placeholder="Waist"
                />
              </div>
              <div>
                <Label htmlFor="hips">Hips</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  value={formData.measurements.hips}
                  onChange={(e) => updateMeasurement('hips', e.target.value)}
                  placeholder="Hips"
                />
              </div>
              <div>
                <Label htmlFor="bicep_left">Left Bicep</Label>
                <Input
                  id="bicep_left"
                  type="number"
                  step="0.1"
                  value={formData.measurements.bicep_left}
                  onChange={(e) => updateMeasurement('bicep_left', e.target.value)}
                  placeholder="Left Bicep"
                />
              </div>
              <div>
                <Label htmlFor="bicep_right">Right Bicep</Label>
                <Input
                  id="bicep_right"
                  type="number"
                  step="0.1"
                  value={formData.measurements.bicep_right}
                  onChange={(e) => updateMeasurement('bicep_right', e.target.value)}
                  placeholder="Right Bicep"
                />
              </div>
              <div>
                <Label htmlFor="thigh_left">Left Thigh</Label>
                <Input
                  id="thigh_left"
                  type="number"
                  step="0.1"
                  value={formData.measurements.thigh_left}
                  onChange={(e) => updateMeasurement('thigh_left', e.target.value)}
                  placeholder="Left Thigh"
                />
              </div>
              <div>
                <Label htmlFor="thigh_right">Right Thigh</Label>
                <Input
                  id="thigh_right"
                  type="number"
                  step="0.1"
                  value={formData.measurements.thigh_right}
                  onChange={(e) => updateMeasurement('thigh_right', e.target.value)}
                  placeholder="Right Thigh"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Any additional notes about your health metrics..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Recording...' : 'Record Metrics'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}