import axios from 'axios';
import { ConnectorCategory, constructAuthUrl } from '@panora/shared';

interface PanoraConfig {
  projectId: string;
  overrideApiUrl?: string;
}

interface Credentials {
  username?: string;
  password?: string;
  apiKey?: string;
}

interface ConnectOptions {
  providerName: string;
  vertical: ConnectorCategory;
  linkedUserId: string;
  credentials?: Credentials;
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    overrideReturnUrl?: string;
  }
}

interface IGConnectionDto {
  query: {
    providerName: string;
    vertical: string;
    projectId: string;
    linkedUserId: string;
  },
  data: {
    [key: string]: string;
  }
}

class Panora {
  private apiUrl: string;
  private projectId: string | null = null;

  constructor(config: PanoraConfig) {
    this.projectId = config.projectId;
    this.apiUrl = config.overrideApiUrl || 'https://api.panora.dev';
  }

  async connect(options: ConnectOptions): Promise<Window | null> {
    const { providerName, vertical, linkedUserId, credentials, options: {onSuccess, onError, overrideReturnUrl} = {} } = options;

    try {
      if(!this.projectId) throw new ReferenceError("ProjectId is invalid or undefined")

      if (credentials) {
        // Handle API Key or Basic Auth
        return this.handleCredentialsAuth(this.projectId, providerName, vertical, linkedUserId, credentials, onSuccess, onError);
      } else {
        // Handle OAuth
        return this.handleOAuth(this.projectId, providerName, vertical, linkedUserId, overrideReturnUrl, onSuccess, onError);
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      return null;
    }
  }

  private async handleCredentialsAuth(
    projectId: string,
    providerName: string,
    vertical: string,
    linkedUserId: string,
    credentials: Credentials,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ): Promise<null> {
    const connectionData: IGConnectionDto = {
      query: {
        providerName,
        vertical,
        projectId,
        linkedUserId,
      },
      data: credentials as {[key: string]: any}
    };

    try {
      const response = await fetch(
        `${this.apiUrl}/connections/basicorapikey/callback?state=${encodeURIComponent(JSON.stringify(connectionData.query))}`,
        {
          method: 'POST',
          body: JSON.stringify(connectionData.data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unknown error occurred");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }

    return null;
  }

  private async handleOAuth(
    projectId: string,
    providerName: string,
    vertical: string,
    linkedUserId: string,
    overrideReturnUrl?: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ): Promise<Window | null> {
    const returnUrl = overrideReturnUrl || `${window.location.origin}`;

    const authUrl = await constructAuthUrl({
      projectId,
      linkedUserId,
      providerName,
      returnUrl,
      apiUrl: this.apiUrl,
      vertical
    });

    if (!authUrl) {
      throw new Error(`Auth URL is invalid: ${authUrl}`);
    }

    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const authWindow = window.open(authUrl, 'OAuth', `width=${width},height=${height},top=${top},left=${left}`);

    if (authWindow) {
      this.pollForRedirect(authWindow, returnUrl, onSuccess, onError);
    }

    return authWindow;
  }

  private pollForRedirect(authWindow: Window, returnUrl: string, onSuccess?: () => void, onError?: (error: Error) => void) {
    const interval = setInterval(() => {
      try {
        const redirectedURL = authWindow.location.href;
        if (redirectedURL.startsWith(returnUrl)) {
          if (onSuccess) {
            onSuccess();
          }
          clearInterval(interval);
          authWindow.close();
        }
      } catch (e) {
        // Ignore cross-origin errors
      }

      if (authWindow.closed) {
        clearInterval(interval);
        if (onError) {
          onError(new Error('Authentication window was closed'));
        }
      }
    }, 500);
  }
}

export default Panora;