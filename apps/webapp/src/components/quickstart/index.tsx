import { Badge } from "../ui/badge";

export default function QuickStartPage() {
    return (
      <div className="flex space-y-2">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col items-start justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Quickstart</h2>
          <h2 className="text-lg font-bold tracking-tight"> This quickstart will show you how to integrate Panora with your application in approximately 3 minutes.</h2>
          <h2 className="text-lg font-bold tracking-tight"> By the end, you will have synced data from a sample customer's HubSpot and queried it.</h2>
        </div>    
          <div className="items space-y-4  pt-6">
         
          </div>
             <div className="text-left">
              <h1 className="text-lg font-bold tracking- pb-2">
                <Badge className="">1. Create a connection</Badge>
              </h1>
              <p className="">
                <p className="pb-4">
                  <Badge variant={"outline"} className="text-lg">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  <p className="ml-2">🦖 Generate a magic link for your customer.</p></Badge></p>
                <img src="/quickstart/gif11.gif" className="border-[0.5px] rounded-md border-white mb-4" width={"100%"}/>
                <p className="pb-4">
                  <Badge variant={"outline"} className="text-lg">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  <p className="ml-2">🦕 You can share it to your existing customers so they can connect through oAuth.</p>
                  </Badge>
                </p>
                <div className="flexjustify-center">
                <img src="/quickstart/gif12.gif" className="border-[0.5px] rounded-md border-white mb-4"/>
                </div>
                
              </p>

              <h1 className="text-lg font-bold tracking- pb-2">
                <Badge className="">2. Make Unified Requests and enjoy :)</Badge>
              </h1>
              <p className="">
                <p className="pb-4">
                  <Badge variant={"outline"} className="text-lg">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  <p className="ml-2">🐑 See your user's data being synced periodically.</p></Badge></p>
                  <img src="/quickstart/5.png" className="border-[0.5px] rounded-md border-white mb-4"/>

                <p className="pb-4">
                  <Badge variant={"outline"} className="text-lg">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                  <p className="ml-2">🐰 Play with our unified endpoints.</p>
                  </Badge>
                </p>
                <div className="flex flex-col">
                <Badge variant={"outline"} className="text-sm text-left mb-3">
                  <Badge className="mr-2 my-2">GET</Badge> https://app.panora.dev/crm/contacts?integrationId=hubspot&linkedUserId=your_linked_user_id
                </Badge>
                <Badge variant={"outline"} className="text-sm text-left">
                  <Badge className="mr-2 my-2">POST</Badge> https://app.panora.dev/crm/contacts?integrationId=hubspot&linkedUserId=your_linked_user_id
                  </Badge>
                </div>
                
              </p>
             </div>
        </div>
      </div>
    );
  }