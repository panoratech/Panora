import TaskPage from "./Task";

export default function JobsPage() {
    return (
      <div>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
          <div className="flex items-center space-x-2">
          </div>
        </div>
        <div>
          <TaskPage/>
        </div>
      </div>
    );
  }