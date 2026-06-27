// app/pos/layout.tsx
export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background overflow-hidden">{children}</div>
  );
}
