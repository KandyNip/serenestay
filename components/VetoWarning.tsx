import { AlertTriangle } from 'lucide-react';

interface VetoWarningProps {
  warning: string;
  type?: 'wifi' | 'medical' | 'general';
}

/**
 * VetoWarning Component
 * Displays a warm but noticeable warning for destinations with limitations
 * Shows when WiFi ≤ 2 or Medical ≤ 2
 */
export default function VetoWarning({
  warning,
  type = 'general',
}: VetoWarningProps) {
  // Icon based on warning type
  const getIcon = () => {
    switch (type) {
      case 'wifi':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case 'medical':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  // Get message prefix based on type
  const getPrefix = () => {
    switch (type) {
      case 'wifi':
        return 'Limited Connectivity';
      case 'medical':
        return 'Healthcare Note';
      default:
        return 'Heads Up';
    }
  };

  return (
    <div
      className="flex items-start gap-4 p-4 bg-warning/10 border border-warning/30 rounded-xl animate-fade-in"
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center text-warning">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-primary flex items-center gap-2">
          <span>{getPrefix()}</span>
          <AlertTriangle className="w-4 h-4 text-warning" />
        </h4>
        <p className="mt-1 text-sm text-primary/70 leading-relaxed">
          {warning}
        </p>
        
        {/* Suggestion */}
        <p className="mt-2 text-xs text-primary/50 italic">
          Serene can help you find alternatives that better match your needs.
        </p>
      </div>
    </div>
  );
}
