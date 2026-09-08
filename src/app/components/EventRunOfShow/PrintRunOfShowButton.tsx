'use client';

export function PrintRunOfShowButton({ className }: { className: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print
    </button>
  );
}
