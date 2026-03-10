export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Navigation sidebar/header will be added here */}
      <main>{children}</main>
    </div>
  );
}
