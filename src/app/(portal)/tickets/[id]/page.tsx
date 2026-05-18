export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="text-2xl font-semibold text-on-surface">Ticket: {id}</h1></div>;
}
