import ChatUI from "./ChatUI";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { id: string } }) {
  return <ChatUI id={params.id} />;
}
