import { Check, MapPin, Camera, CameraOff, Flag } from 'lucide-react';
import type { Visit } from '../../types/index.js';

interface StepTrackerProps {
  visit: Visit | null;
  currentStep: string;
  viewingStep?: string | null;
  onStepClick?: (stepKey: string) => void;
}

const steps = [
  { key: 'checkIn', label: 'Check-in', icon: MapPin },
  { key: 'arrivalPhotos', label: 'Arrival Photos', icon: Camera },
  { key: 'departurePhotos', label: 'Departure Photos', icon: CameraOff },
  { key: 'complete', label: 'Complete', icon: Flag },
];

const stepOrder = ['checkIn', 'arrivalPhotos', 'departurePhotos', 'complete'];

export default function StepTracker({ visit, currentStep, viewingStep, onStepClick }: StepTrackerProps) {
  const activeIdx = stepOrder.indexOf(currentStep);
  const viewIdx = viewingStep ? stepOrder.indexOf(viewingStep) : -1;

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, i) => {
        const stepStatus = visit?.steps[step.key as keyof typeof visit.steps];
        const isCompleted = stepStatus?.status === 'completed' || stepStatus?.status === 'approved';
        const isActive = i === activeIdx && viewIdx === -1;
        const isViewing = i === viewIdx;
        const isClickable = onStepClick && i <= activeIdx && visit;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.key)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isViewing
                    ? 'bg-accent text-white ring-2 ring-accent ring-offset-2'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-accent text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                disabled={!isClickable}
              >
                {isCompleted && !isViewing ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </button>
              <span className={`text-xs mt-1 text-center ${isActive || isViewing ? 'text-accent font-semibold' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                i < activeIdx ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
