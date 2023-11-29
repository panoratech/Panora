import ConnectionTable from "./Connection";

export default function ConnectionsPage() {
    return (
      <div>
        <div className="flex items-center justify-between space-y-2">
        <div className="flex items-start flex-col">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Connections</h2>
          <h2 className="text-lg font-bold tracking-tight">Integrations between your users’ accounts and third-party apps.</h2>
        </div>
          <div className="flex items-center space-x-2">
          </div>
        </div>
        <div>
          <ConnectionTable/>
        </div>
      </div>
    );
  }