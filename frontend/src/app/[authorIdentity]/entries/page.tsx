import { permanentRedirect } from 'next/navigation'

export default async function Page (props: { params: Promise<{ authorIdentity: string }> }): Promise<void> {
  const params = await props.params
  permanentRedirect(`/${decodeURIComponent(params.authorIdentity)}`)
}
