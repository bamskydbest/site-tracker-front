import { useState, useCallback, useEffect } from 'react';
import StepTracker from '../components/technician/StepTracker.js';
import StepCheckIn from '../components/technician/StepCheckIn.js';
import StepPhotos from '../components/technician/StepPhotos.js';
import StepComplete from '../components/technician/StepComplete.js';
import Spinner from '../components/ui/Spinner.js';
import { getVisitById } from '../services/visitService.js';
import type { Visit } from '../types/index.js';

const VISIT_KEY = 'sitetracker_active_visit';

export default function TechnicianFlow() {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('checkIn');
  const [viewingStep, setViewingStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore visit from sessionStorage on mount
  useEffect(() => {
    const savedVisitId = sessionStorage.getItem(VISIT_KEY);
    if (savedVisitId) {
      getVisitById(savedVisitId)
        .then((v) => {
          setVisit(v);
          setCurrentStep(v.currentStep);
        })
        .catch(() => {
          sessionStorage.removeItem(VISIT_KEY);
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
    sessionStorage.setItem(VISIT_KEY, v._id);
  }, []);

  const handleCheckInComplete = (newVisit: Visit) => {
    updateVisit(newVisit);
  };

  const handlePhotosApproved = useCallback((updatedVisit: Visit) => {
    updateVisit(updatedVisit);
  }, [updateVisit]);

  const handleNewVisit = () => {
    sessionStorage.removeItem(VISIT_KEY);
    setVisit(null);
    setCurrentStep('checkIn');
    setViewingStep(null);
  };

  const handleStepClick = (stepKey: string) => {
    setViewingStep(stepKey);
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  const activeStep = viewingStep || currentStep;

  const renderStep = () => {
    switch (activeStep) {
      case 'checkIn':
        return <StepCheckIn onComplete={handleCheckInComplete} />;
      case 'arrivalPhotos':
        return visit ? <StepPhotos visit={visit} type="arrival" onApproved={handlePhotosApproved} onVisitUpdate={updateVisit} /> : null;
      case 'departurePhotos':
        return visit ? <StepPhotos visit={visit} type="departure" onApproved={handlePhotosApproved} onVisitUpdate={updateVisit} /> : null;
      case 'complete':
        return visit ? <StepComplete visit={visit} onNewVisit={handleNewVisit} /> : null;
      default:
        return null;
    }
  };

  return (
    <div>
      <StepTracker visit={visit} currentStep={currentStep} viewingStep={viewingStep} onStepClick={handleStepClick} />
      {renderStep()}
    </div>
  );
}
