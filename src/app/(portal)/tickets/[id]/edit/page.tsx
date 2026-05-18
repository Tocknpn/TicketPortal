export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="text-2xl font-semibold text-on-surface">Edit Ticket: {id}</h1></div>;
}
