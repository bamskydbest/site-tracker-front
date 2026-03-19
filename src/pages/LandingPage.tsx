import { useNavigate } from 'react-router-dom';
import { Shield, Wrench, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button.js';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="text-center text-white max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/k-NET.png" alt="K-NET" className="h-10 w-auto sm:h-14" />
          <h1 className="text-4xl sm:text-5xl font-bold">Site Tracker</h1>
        </div>
        <p className="text-lg text-gray-300 mb-12">
          K-NET field operations portal. Log site visits, capture installation photos, and keep your team in sync — all in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/admin/login')}
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            <Shield className="w-5 h-5" />
            Admin Portal
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/technician')}
            className="w-full sm:w-auto sm:min-w-[200px] !border-white !text-white hover:!bg-white hover:!text-primary"
          >
            <Wrench className="w-5 h-5" />
            Technician
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto sm:min-w-[200px] !border-white/60 !text-white/80 hover:!bg-white/10 hover:!text-white hover:!border-white"
          >
            <UserPlus className="w-5 h-5" />
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
