// import loadStytch, { DiscoveredOrganizations } from "@/lib/stytch/loadStytch";
// import { getDiscoverySessionData } from "@/lib/stytch/sessionService";
// import { cookies } from "next/headers";
// import Link from "next/link";
// import { CardTitle, CardHeader, CardContent, CardDescription, Card } from "../ui/card";

// async function getProps() {
//     const discoverySessionData = getDiscoverySessionData(
//       cookies().get('session')?.value,
//       cookies().get('intermediate_session')?.value,
//     );
//     if (discoverySessionData.error) {
//       console.log("No session tokens found...");
//       return { redirect: { statusCode: 307, destination: `/auth/login` } };
//     }
  
//     const { discovered_organizations } =
//       await loadStytch().discovery.organizations.list({
//         intermediate_session_token: discoverySessionData.intermediateSession,
//         session_jwt: discoverySessionData.sessionJWT,
//       });
  
//     console.log(discovered_organizations);
  
//     return {
//       discovered_organizations
//     };
// }

// type Props = {
//     discovered_organizations: DiscoveredOrganizations;
// };

// const DiscoveredOrganizationsList = ({ discovered_organizations }: Props) => {
//     const formatMembership = ({
//       membership, 
//       organization,
//     }: Pick<DiscoveredOrganizations[0], "membership" | "organization">) => {
//       if (membership!.type === "pending_member") {
//         return `Join ${organization!.organization_name}`;
//       }
//       if (membership!.type === "eligible_to_join_by_email_domain") {
//         return `Join ${organization!.organization_name} via your ${membership!.details!.domain} email`;
//       }
//       if (membership!.type === "invited_member") {
//         return `Accept Invite for ${organization!.organization_name}`;
//       }
//       return `Continue to ${organization!.organization_name}`;
//     };
  
//     return (
//       <Card className="m-10">
//       <CardHeader>
//         <img src="/logo.png" className='w-14 mb-5' />
//         <CardTitle>Your Organizations</CardTitle>
//         <CardDescription>{discovered_organizations.length === 0 && (
//           <p>No existing organizations.</p>
//         )}</CardDescription>
//       </CardHeader>
//       <CardContent className="grid gap-4 focus:outline-none focus:border">
//         {discovered_organizations.map(({ organization, membership }) => (
//             <Link key={organization!.organization_id} href={`/api/discovery/${organization!.organization_id}`}>
//             <div className=" flex items-center space-x-4 rounded-md border p-4">
//               <div className="flex-1 space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                 {formatMembership({ organization, membership })}
//                 </p>
//               </div>
//             </div>
//             </Link>
//         ))}
        
//       </CardContent>
//       </Card>
//     );
//   };
  
// const DiscoveryServer = async () => {
//     const {discovered_organizations} = await getProps();
//     return (
//         <DiscoveredOrganizationsList
//             discovered_organizations={discovered_organizations!}
//         />
//     );
// };

// export default DiscoveryServer;