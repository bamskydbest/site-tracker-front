import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.js';
import Input from '../ui/Input.js';
import GpsIndicator from './GpsIndicator.js';
import Card from '../ui/Card.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { createVisit } from '../../services/visitService.js';
import { DEPARTMENTS } from '../../types/index.js';
import type { Visit } from '../../types/index.js';

const CHECKIN_KEY = 'sitetracker_checkin_key';

interface StepCheckInProps {
  onComplete: (visit: Visit) => void;
}

export default function StepCheckIn({ onComplete }: StepCheckInProps) {
  const [technicianName, setTechnicianName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [reason, setReason] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const geo = useGeolocation();
  const idempotencyKey = useRef<string>('');

  useEffect(() => {
    let key = localStorage.getItem(CHECKIN_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(CHECKIN_KEY, key);
    }
    idempotencyKey.current = key;
  }, []);

  const handleSubmit = async () => {
    if (!technicianName.trim() || !siteName.trim() || !reason.trim() || !department) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!geo.location) {
      toast.error('GPS location is required');
      return;
    }

    setLoading(true);
    try {
      const visit = await createVisit({
        technicianName: technicianName.trim(),
        siteName: siteName.trim(),
        reason: reason.trim(),
        department,
        gpsLocation: geo.location,
        idempotencyKey: idempotencyKey.current,
      });
      localStorage.removeItem(CHECKIN_KEY);
      toast.success('Check-in successful!');
      onComplete(visit);
    } catch {
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Site Check-in</h2>
      <div className="space-y-4">
        <Input
          label="Technician Name"
          placeholder="Enter your full name"
          value={technicianName}
          onChange={(e) => setTechnicianName(e.target.value)}
        />
        <Input
          label="Site Name"
          placeholder="Enter site name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
        <Input
          label="Reason for Visit"
          placeholder="e.g. Routine maintenance, fault repair..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GPS Location</label>
          <GpsIndicator location={geo.location} loading={geo.loading} error={geo.error} />
        </div>

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!geo.location}
          className="w-full"
          size="lg"
        >
          Confirm Arrival
        </Button>
      </div>
    </Card>
  );
}
