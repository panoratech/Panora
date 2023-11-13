import { providersArray } from "../helpers/utils";

// Assuming you have these types defined
type ProviderModalProps = {
  isOpen: boolean;
  onSelectProvider: (providerName: string) => void;
  onClose: () => void;
};

const ProviderModal = ({ isOpen, onSelectProvider, onClose }: ProviderModalProps) => {
  if (!isOpen) {console.log("null modal"); return null}
  const PROVIDERS = providersArray('CRM');
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-black rounded-lg shadow-lg p-5" style={{ width: '80%', maxWidth: '600px' }}>
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-xl font-bold">Select CRM Provider</h6>
          <button onClick={onClose}>X</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PROVIDERS.map(provider => (
            <button
              key={provider.name}
              onClick={() => onSelectProvider(provider.name)}
              className="aspect-w-1 aspect-h-1 border border-gray-200 rounded-lg flex justify-center items-center hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center p-3">
                <img src={provider.logoPath} alt={provider.name} className="w-auto rounded-xl" />
                <span className="mt-2">{provider.name.toUpperCase()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
