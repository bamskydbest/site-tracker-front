import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Radio, Wifi, Network } from 'lucide-react';
import Button from '../ui/Button.js';
import Input from '../ui/Input.js';
import GpsIndicator from './GpsIndicator.js';
import Card from '../ui/Card.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { createVisit } from '../../services/visitService.js';
import type { Visit, InstallationType } from '../../types/index.js';

const CHECKIN_KEY = 'sitetracker_checkin_key';

interface StepCheckInProps {
  onComplete: (visit: Visit) => void;
}

interface InstallationOption {
  value: InstallationType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const INSTALLATION_OPTIONS: InstallationOption[] = [
  {
    value: 'radio-installation',
    label: 'Radio Installation',
    description: 'Wireless radio equipment setup',
    icon: <Radio className="w-4 h-4" />,
  },
  {
    value: 'poe-installation',
    label: 'POE Installation',
    description: 'Power over Ethernet device setup',
    icon: <Network className="w-4 h-4" />,
  },
  {
    value: 'poe-uplink',
    label: 'POE Uplink',
    description: 'POE uplink configuration',
    icon: <Wifi className="w-4 h-4" />,
  },
];

export default function StepCheckIn({ onComplete }: StepCheckInProps) {
  const [technicianName, setTechnicianName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [reason, setReason] = useState('');
  const [installationTypes, setInstallationTypes] = useState<InstallationType[]>([]);
  const [loading, setLoading] = useState(false);
  const geo = useGeolocation();
  const idempotencyKey = useRef<string>('');

  // Generate or restore idempotency key so retries (even after refresh) are safe
  useEffect(() => {
    let key = localStorage.getItem(CHECKIN_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(CHECKIN_KEY, key);
    }
    idempotencyKey.current = key;
  }, []);

  const toggleInstallationType = (type: InstallationType) => {
    setInstallationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (!technicianName.trim() || !siteName.trim() || !reason.trim()) {
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
        gpsLocation: geo.location,
        idempotencyKey: idempotencyKey.current,
        installationTypes,
      });
      // Key consumed — clear it so a future new check-in gets a fresh key
      localStorage.removeItem(CHECKIN_KEY);
      toast.success('Check-in successful!');
      onComplete(visit);
    } catch {
      toast.error('Failed to check in. Please try again.');
      // Key is intentionally kept in localStorage so the next retry is idempotent
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
          placeholder="Enter your name"
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

        {/* Work Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Scope
            <span className="ml-1 text-xs font-normal text-gray-400">(select all that apply)</span>
          </label>
          <div className="space-y-2">
            {INSTALLATION_OPTIONS.map((option) => {
              const checked = installationTypes.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                    checked
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInstallationType(option.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked ? 'border-accent bg-accent' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-2 ${checked ? 'text-accent' : 'text-gray-600'}`}
                  >
                    {option.icon}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${checked ? 'text-accent' : 'text-gray-800'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
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
