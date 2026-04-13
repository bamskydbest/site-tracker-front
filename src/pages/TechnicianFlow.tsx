import { useState, useCallback, useEffect } from 'react';
import { HardHat, UserRound } from 'lucide-react';
import StepTracker from '../components/technician/StepTracker.js';
import StepCheckIn from '../components/technician/StepCheckIn.js';
import StepPhotos from '../components/technician/StepPhotos.js';
import StepComplete from '../components/technician/StepComplete.js';
import ExternalWaiting from '../components/technician/ExternalWaiting.js';
import Spinner from '../components/ui/Spinner.js';
import { getVisitById } from '../services/visitService.js';
import type { Visit } from '../types/index.js';

const VISIT_KEY = 'sitetracker_active_visit';

const VISITOR_OPTIONS = [
  {
    type: 'internal' as const,
    icon: HardHat,
    title: 'Internal Technician',
    subtitle: 'K-NET Staff',
    description: 'For K-NET employees performing scheduled or unscheduled field site visits.',
    badge: 'Instant check-in',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-[#002f6c]',
    accentColor: 'group-hover:border-[#002f6c]/30 group-hover:shadow-[#002f6c]/8',
  },
  {
    type: 'external' as const,
    icon: UserRound,
    title: 'External Visitor',
    subtitle: 'Third-Party / Contractor',
    description: 'For contractors, vendors, or third-party personnel requiring access approval.',
    badge: 'Requires approval',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-[#2e94eb]',
    accentColor: 'group-hover:border-[#2e94eb]/30 group-hover:shadow-[#2e94eb]/8',
  },
] as const;

function VisitorTypeSelection({ onSelect }: { onSelect: (type: 'internal' | 'external') => void }) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-72px)]">

      {/* Hero band */}
      <div className="bg-[#002f6c] px-5 py-8 sm:py-12 text-center rounded-2xl mb-5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#2e94eb]/15 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/70 text-[10px] font-semibold px-3 py-1 rounded-full mb-4 tracking-[0.12em] uppercase">
            Site Access Portal
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            How are you visiting today?
          </h1>
          <p className="text-white/50 text-sm mt-2.5 max-w-xs mx-auto leading-relaxed">
            Select your visitor type to begin the correct check-in process.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {VISITOR_OPTIONS.map(({ type, icon: Icon, title, subtitle, description, badge, badgeColor, iconBg }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="group flex flex-col text-left p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-gray-300 active:scale-[0.99] transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2e94eb]/50 w-full"
          >
            {/* Top row: icon + badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl ${iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border leading-none ${badgeColor}`}>
                {badge}
              </span>
            </div>

            {/* Text block */}
            <p className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-1">{subtitle}</p>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>

            {/* CTA row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-[#002f6c] transition-colors">
                Select & Continue
              </span>
              <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#002f6c] flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                <span className="text-gray-500 group-hover:text-white text-sm leading-none transition-colors">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-[11px] text-gray-400 mt-5 pb-2 px-4">
        External visitors will be notified by email once a decision is made by the superadmin.
      </p>
    </div>
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
