import { useState, useCallback, useEffect } from 'react';
import { HardHat, UserRound } from 'lucide-react';
import StepTracker from '../components/technician/StepTracker.js';
import StepCheckIn from '../components/technician/StepCheckIn.js';
import StepPhotos from '../components/technician/StepPhotos.js';
import StepComplete from '../components/technician/StepComplete.js';
import ExternalWaiting from '../components/technician/ExternalWaiting.js';
import Spinner from '../components/ui/Spinner.js';
import Card from '../components/ui/Card.js';
import { getVisitById } from '../services/visitService.js';
import type { Visit } from '../types/index.js';

const VISIT_KEY = 'sitetracker_active_visit';

function VisitorTypeSelection({ onSelect }: { onSelect: (type: 'internal' | 'external') => void }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please select how you are visiting the site today.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('internal')}
          className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <HardHat className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Internal Technician</p>
            <p className="text-xs text-gray-500 mt-1">K-NET staff visiting a site</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('external')}
          className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <UserRound className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">External Visitor</p>
            <p className="text-xs text-gray-500 mt-1">Contractor or third-party visitor</p>
          </div>
        </button>
      </div>
    </Card>
  );
}

export default function TechnicianFlow() {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [visitorType, setVisitorType] = useState<'internal' | 'external' | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('checkIn');
  const [viewingStep, setViewingStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore visit from localStorage on mount
  useEffect(() => {
    const savedVisitId = localStorage.getItem(VISIT_KEY);
    if (savedVisitId) {
      getVisitById(savedVisitId)
        .then((v) => {
          setVisit(v);
          setCurrentStep(v.currentStep);
          setVisitorType(v.visitorType ?? 'internal');
        })
        .catch(() => {
          localStorage.removeItem(VISIT_KEY);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const updateVisit = useCallback((v: Visit) => {
    setVisit(v);
    setCurrentStep(v.currentStep);
    setViewingStep(null);
    localStorage.setItem(VISIT_KEY, v._id);
  }, []);

  const handleCheckInComplete = (newVisit: Visit) => {
    updateVisit(newVisit);
    setVisitorType(newVisit.visitorType ?? 'internal');
  };

  const handlePhotosApproved = useCallback((updatedVisit: Visit) => {
    updateVisit(updatedVisit);
  }, [updateVisit]);

  const handleNewVisit = () => {
    localStorage.removeItem(VISIT_KEY);
    setVisit(null);
    setCurrentStep('checkIn');
    setViewingStep(null);
    setVisitorType(null);
  };

  const handleStepClick = (stepKey: string) => {
    setViewingStep(stepKey);
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  // External visitor flow — dedicated path, no step tracker
  if (visit?.visitorType === 'external') {
    return <ExternalWaiting visit={visit} onNewVisit={handleNewVisit} />;
  }

  const activeStep = viewingStep || currentStep;

  const renderStep = () => {
    // No visit yet — show type selection or check-in form
    if (!visit) {
      if (!visitorType) return <VisitorTypeSelection onSelect={setVisitorType} />;
      return <StepCheckIn visitorType={visitorType} onComplete={handleCheckInComplete} />;
    }

    // Internal flow
    switch (activeStep) {
      case 'checkIn':
        return <StepCheckIn visitorType="internal" onComplete={handleCheckInComplete} />;
      case 'arrivalPhotos':
        return <StepPhotos key={`${visit._id}-arrival`} visit={visit} type="arrival" onApproved={handlePhotosApproved} onVisitUpdate={updateVisit} />;
      case 'departurePhotos':
        return <StepPhotos key={`${visit._id}-departure`} visit={visit} type="departure" onApproved={handlePhotosApproved} onVisitUpdate={updateVisit} />;
      case 'complete':
        return <StepComplete visit={visit} onNewVisit={handleNewVisit} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {visit && <StepTracker visit={visit} currentStep={currentStep} viewingStep={viewingStep} onStepClick={handleStepClick} />}
      {renderStep()}
    </div>
  );
}
