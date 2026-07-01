'use client';

import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerNote() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
        This itinerary is curated based on destination data and wellness expertise.
        Specific venues, programs, and prices may vary — we recommend verifying details before booking.
      </p>
    </div>
  );
}
