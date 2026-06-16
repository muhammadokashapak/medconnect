import ChatUI from "./ChatUI";

export const dynamic = "force-dynamic";

export default async function Page(props: { params: any }) {
  const params = await props.params;
  const id = params?.id || (props.params as any)?.id;
  return <ChatUI id={id} />;
}
