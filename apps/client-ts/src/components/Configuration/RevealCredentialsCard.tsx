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
import useProjectStore from "@/state/projectStore";
import { Input } from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton'
import useAuthCredentials from '@/hooks/useAuthCredentials';
import { AuthStrategy } from '@panora/shared';

interface propType {
    data: {
        status: boolean;
        provider_name: string;
        auth_type: number;
        id_cs: string;
        vertical: string;
        type: string;
    }


}

const RevealCredentialsCard = (data : propType) => {

    const {type,auth_type} = data.data
    const {idProject} = useProjectStore();

    const {data: authCredentialsData, isLoading: isAuthCredentialsLoading,error: isAuthCredentialsError} = useAuthCredentials(
        idProject,
        type,
        auth_type===AuthStrategy.oauth2? ["client_id","client_secret"] : auth_type===AuthStrategy.api_key? ["api_key"] : ["username","secret"]
    )

    if(authCredentialsData)
        {
            console.log(authCredentialsData)
        }
    

    if(isAuthCredentialsError)
        {
            console.log("error in AuthCredentials Fetching!!")
        }


    const [open, setOpen] = useState(false);
    // const [loading,setLoading] = useState(true);

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

                {/* <div>{JSON.stringify(data.data)}</div> */}

            {isAuthCredentialsLoading && (
                <div className="flex flex-col items-center space-x-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[200px]" />

                </div>
            </div>
            )}



                {authCredentialsData && (
                    <>
                    <div>{authCredentialsData.authValues}</div>
                    </>
                )}
                
               



            </CardContent>

        </DialogContent>

    </Dialog>
  )
}

export default RevealCredentialsCard