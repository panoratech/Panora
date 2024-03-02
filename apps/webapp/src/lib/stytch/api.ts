import config from '@/utils/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from "sonner"

export const useStytchDiscoveryStartMutation = () => {
    const startDiscovery = async (data: { email: string }) => {
        const response = await fetch(`${config.API_URL}/stytch/discovery/start`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to start discovery');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: startDiscovery,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
            return 200;
        },
        onSettled: () => {
        },
    });
};

export const useStytchLoginMutation = () => {
    const login = async (data: { email: string; organization_id: string }) => {
        const response = await fetch(`${config.API_URL}/stytch/login`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to login');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: login,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchLogout = () => {
    return useQuery({
      queryKey: ['stytch-logout'], 
      queryFn: async () => {
        const response = await fetch(`${config.API_URL}/stytch/logout`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
      }
    });
};

export const useStytchInviteMutation = () => {
    const invite = async (data: { email: string }) => {
        const response = await fetch(`${config.API_URL}/stytch/invite`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to invite');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: invite,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchDeleteMemberMutation = () => {
    const deleteMember = async (data: { member_id: string }) => {
        const response = await fetch(`${config.API_URL}/stytch/deleteMember`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete member');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: deleteMember,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchCreateSamlSSOConnMutation = () => {
    const create = async (data: {display_name: string}) => {
        const response = await fetch(`${config.API_URL}/stytch/saml/sso/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete member');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: create,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchCreateOrganizationFromDiscoveryMutation = () => {
    const create = async (data: {organization_name: string; require_mfa?: boolean}) => {
        const response = await fetch(`${config.API_URL}/stytch/discovery/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete member');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: create,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchUpdateSamlSSOConnMutation = () => {
    const update = async (data: {
        display_name: string;
        idp_sso_url: string;
        idp_entity_id: string;
        email_attribute: string;
        first_name_attribute: string;
        last_name_attribute: string;
        certificate: string;
        connection_id: string;
    }) => {
        const response = await fetch(`${config.API_URL}/stytch/sso/saml/update`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete member');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: update,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchCreateOidSSOConnMutation = () => {
    const createOidSSO = async (data: {display_name: string}) => {
        const response = await fetch(`${config.API_URL}/stytch/sso/oidc/create`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete member');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: createOidSSO,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};

export const useStytchUpdateOidcSSOConnMutation = () => {
    const update = async (data: {
        display_name: string;
        client_id: string;
        client_secret: string;
        issuer: string;
        authorization_url: string;
        token_url: string;
        userinfo_url: string;
        jwks_url: string;
        connection_id: string;
    }) => {
        const response = await fetch(`${config.API_URL}/stytch/oidc/sso/update`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to update oidssc');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: update,
        onMutate: () => {
            toast("Organisation is being created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onError: (error) => {
            toast("Organisation creation failed !", {
                description: error.message,
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSuccess: () => {
            toast("Organisation has been created !", {
                description: "",
                action: {
                  label: "Close",
                  onClick: () => console.log("Close"),
                },
            })
        },
        onSettled: () => {
        },
    });
};
