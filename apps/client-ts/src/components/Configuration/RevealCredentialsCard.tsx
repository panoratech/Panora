import React,{useState} from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Badge,badgeVariants } from "@/components/ui/badge"
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { PasswordInput } from '@/components/ui/password-input'
import { Input } from '@/components/ui/input'

interface propType {
    auth_type:string,
    authCredentials:{
        clientID?:string,
        clientSecret?:string,
        scope?:string,
        apiKey?:string,
        username?:string,
        secret?:string,

    }


}

const RevealCredentialsCard = (data : propType) => {

    const {authCredentials,auth_type} = data

    const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Badge variant="outline" className=' cursor-pointer'>Reveal Credentials</Badge>
        </DialogTrigger>
        <DialogContent className='sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen'>
            <CardHeader>
                <CardTitle>Credentials</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-5'>
                {/* <div>{JSON.stringify(data.authCredentials)}</div> */}
                
                {data.auth_type==="0Auth2" && (
                    <>
                    <div className='flex flex-col'>
                        <div className="flex flex-col">Client ID</div>
                        <Input type="text" value={authCredentials.clientID} readOnly />
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex flex-col">Client Secret</div>
                        <Input type="text" value={authCredentials.clientSecret} readOnly />
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex flex-col">Scopes</div>
                        <Input type="text" value={authCredentials.scope} readOnly />
                    </div>
                    </>
                )}


                {data.auth_type==="API" && (
                    <>
                    <div className='flex flex-col'>
                        <div className="flex flex-col">API</div>
                        <Input type="text" value={authCredentials.apiKey} readOnly />
                    </div>
                    
                    </>
                )}

                {data.auth_type==="Basic_Auth" && (
                    <>
                    <div className='flex flex-col'>
                        <div className="flex flex-col">Username</div>
                        <Input type="text" value={authCredentials.username} readOnly />
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex flex-col">Secret</div>
                        <Input type="text" value={authCredentials.secret} readOnly />
                    </div>
                   
                    </>
                )}



            </CardContent>

        </DialogContent>

    </Dialog>
  )
}

export default RevealCredentialsCard