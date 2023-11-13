import React from 'react';

type ProviderModalProps = {
  isOpen: boolean;
  onSelectProvider: (providerName: string) => void;
  onClose: () => void;
};

const PROVIDERS = ['hubspot', 'zoho', 'pipedrive', 'freshsales', 'zendesk'];

const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, onSelectProvider, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Select a CRM Provider</h2>
        {PROVIDERS.map(provider => (
          <button key={provider} onClick={() => onSelectProvider(provider)}>
            Connect to {provider}
          </button>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ProviderModal;
