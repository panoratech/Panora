import SignupForm from "@/components/Auth/SignupForm";
import {getDomainFromRequest} from "@/lib/stytch/urlUtils";
import { headers } from "next/headers";


async function getDomain(){
  const host = headers().get('host')
  const protocol = headers().get('x-forwarded-proto')
  const domain = getDomainFromRequest(host!, protocol!)
  return domain
}

export default async function Page() {
  const domain = await getDomain()
  return <SignupForm domain={domain} />;
}
