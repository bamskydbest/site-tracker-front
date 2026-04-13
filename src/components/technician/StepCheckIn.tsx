import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.js';
import Input from '../ui/Input.js';
import Select from '../ui/Select.js';
import GpsIndicator from './GpsIndicator.js';
import Card from '../ui/Card.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { createVisit } from '../../services/visitService.js';
import { DEPARTMENTS } from '../../types/index.js';
import type { Visit } from '../../types/index.js';

const CHECKIN_KEY = 'sitetracker_checkin_key';

interface StepCheckInProps {
  visitorType: 'internal' | 'external';
  onComplete: (visit: Visit) => void;
}

export default function StepCheckIn({ visitorType, onComplete }: StepCheckInProps) {
  const isExternal = visitorType === 'external';

  // Common fields
  const [technicianName, setTechnicianName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [reason, setReason] = useState('');
  const [department, setDepartment] = useState('');
  // External-only fields
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

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
      toast.error('Please fill in all required fields');
      return;
    }
    if (isExternal) {
      if (!companyName.trim()) {
        toast.error('Please enter your organisation / company name');
        return;
      }
      if (!contactEmail.trim()) {
        toast.error('Please enter a contact email for notifications');
        return;
      }
      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
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
        visitorType,
        ...(isExternal ? { companyName: companyName.trim(), contactEmail: contactEmail.trim() } : {}),
      });
      localStorage.removeItem(CHECKIN_KEY);
      toast.success(isExternal ? 'Request submitted! Awaiting approval.' : 'Check-in successful!');
      onComplete(visit);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        {isExternal ? 'External Visitor Request' : 'Site Check-in'}
      </h2>
      {isExternal && (
        <p className="text-sm text-gray-500 mb-4">
          Fill in the details below. Your request will be reviewed by a superadmin and you will be notified by email.
        </p>
      )}
      <div className="space-y-4 mt-4">
        <Input
          label={isExternal ? 'Visitor Name' : 'Technician Name'}
          placeholder="Enter your full name"
          value={technicianName}
          onChange={(e) => setTechnicianName(e.target.value)}
        />

        {isExternal && (
          <>
            <Input
              label="Organisation / Company"
              placeholder="Enter your organisation or company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              placeholder="Enter email to receive approval notification"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </>
        )}

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

        <Select
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>

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
          {isExternal ? 'Submit Request' : 'Confirm Arrival'}
        </Button>
      </div>
    </Card>
  );
}
