import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { authGate, jsonResponse } from '~/lib/.server/auth';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { BRAND } from '~/utils/brand';

export const meta: MetaFunction = () => {
  return [{ title: BRAND.name }, { name: 'description', content: BRAND.description }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return authGate(request) ?? jsonResponse({});
}

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
