import { useNavigate } from 'react-router-dom';
import { MapPin, Shield, Wrench } from 'lucide-react';
import Button from '../components/ui/Button.js';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="text-center text-white max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <MapPin className="w-12 h-12 text-accent" />
          <h1 className="text-5xl font-bold">Site Tracker</h1>
        </div>
        <p className="text-lg text-gray-300 mb-12">
          Professional site visit tracking system. Check in, capture photos, and manage visits in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/admin/login')}
            className="min-w-[200px]"
          >
            <Shield className="w-5 h-5" />
            Admin Portal
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/technician')}
            className="min-w-[200px] !border-white !text-white hover:!bg-white hover:!text-primary"
          >
            <Wrench className="w-5 h-5" />
            Technician
          </Button>
        </div>
      </div>
    </div>
  );
}
