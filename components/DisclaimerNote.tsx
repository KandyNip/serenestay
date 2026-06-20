'use client';

import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerNote() {
  return (
    <div className="flex items-start gap-2.5 p-3 bg-primary/[0.03] rounded-xl border border-primary/10">
      <Info className="w-4 h-4 text-primary/40 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-primary/50 leading-relaxed">
        This itinerary is AI-generated based on destination data and wellness expertise.
        Specific venues, programs, and prices may vary — we recommend verifying details before booking.
      </p>
    </div>
  );
}
