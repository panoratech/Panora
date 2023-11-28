import { Button } from "../ui/button";
import { CalendarDateRangePicker } from "./../dashboard/components/date-range-picker"

export default function MainPage() {
    return (
        <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>Download</Button>
        </div>
    </div>
    );
  }
