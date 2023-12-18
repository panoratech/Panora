import { Line, LineChart, ResponsiveContainer} from "recharts";
import { Overview } from "../dashboard/components/overview";
import { Button } from "../ui/button";
import { CalendarDateRangePicker } from "../dashboard/components/date-range-picker"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
export default function MainPage() {

  const data = [
    { name: 'Jan', revenue: 15000 },
    { name: 'Feb', revenue: 21000 },
    { name: 'Mar', revenue: 18000 },
    { name: 'Apr', revenue: 25000 },
    { name: 'May', revenue: 27000 },
  ];
  
    return (
        <div className="flex items-center justify-between space-y-2">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <div className="flex items-center space-x-2">
                <CalendarDateRangePicker />
                <Button>Download</Button>
              </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 pt-10 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Total API Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <Overview/>
                    </CardContent>
                  </Card>
                  <div className="col-span-3">
                  <Card className="h-[48%] mb-3">
                    <CardHeader>
                      <CardTitle>Total Connections</CardTitle>
                      <CardDescription>
                        +39 from last month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width='100%' height={163}>
                        <LineChart data={data}>
                          <Line type="monotone" dataKey="revenue" stroke="#adfa1d" strokeWidth={2}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="h-[49%]">
                    <CardHeader>
                      <CardTitle>Linked Accounts</CardTitle>
                      <CardDescription>
                        +78% from last month 
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width='100%' height={40}>
                        <LineChart data={data}>
                          <Line type="monotone" dataKey="revenue" stroke="#adfa1d" strokeWidth={2}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  </div>
                 
                  </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
    );
  }
