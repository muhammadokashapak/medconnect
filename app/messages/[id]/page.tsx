import ChatUI from "./ChatUI";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ChatUI id={resolvedParams.id} />;
}
