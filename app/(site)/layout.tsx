export const metadata = {
  title: 'CENTRE AGAINST TORTURE KENYA FOUNDATION',
  description: 'Centre Against Torture Kenya Foundation provides legal aid, psychosocial support, and advocacy for survivors of torture and human rights violations.',
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
