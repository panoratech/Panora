import LoginDiscoveryForm from "@/components/Auth/LoginDiscoveryForm";
import {getDomainFromRequest} from "@/lib/stytch/urlUtils";
import { headers } from 'next/headers'

async function getDomain() {
    const host = headers().get('host')
    const protocol = headers().get('x-forwarded-proto')

    return getDomainFromRequest(host!, protocol!)
}

export default async function Page() {
    const domain = await getDomain();
    
    return (
        <div className='min-h-screen grid lg:grid-cols-2 mx-auto text-left'>
            <div className='flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
                <img src="/logo.png" className='w-14' />
                <LoginDiscoveryForm domain={domain}/>
            </div>       
            <div className='hidden lg:block relative flex-1'>
                <img className='absolute inset-0 h-full w-full object-cover border-l' src="/bgbg.jpeg" alt='Login Page Image' />
            </div>
        </div>
    )
}
