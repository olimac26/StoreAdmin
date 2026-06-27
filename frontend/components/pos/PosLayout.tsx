// components/pos/POSLayout.tsx
export function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {children}
    </div>
  );
}
