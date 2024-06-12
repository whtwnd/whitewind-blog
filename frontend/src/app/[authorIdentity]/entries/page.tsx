import { permanentRedirect } from 'next/navigation'

export default function Page ({ params }: { params: { authorIdentity: string } }): void {
  permanentRedirect(`/${decodeURIComponent(params.authorIdentity)}`)
}
