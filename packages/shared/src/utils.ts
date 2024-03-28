type ProviderConfig = {
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
  description: string;
  active?: boolean;
  apiUrl?: string;
  customPropertiesUrl?: string; 
};

type VerticalConfig = {
  [key: string]: ProviderConfig;
};

type ProvidersConfig = {
  [vertical: string]: VerticalConfig;
};
 

export const providersConfig: ProvidersConfig = {
  'crm': {
    'hubspot': {
      clientId: 'ba591170-a7c7-4fca-8086-1bd178c6b14d',
      scopes: 'crm.objects.contacts.read crm.objects.contacts.write crm.schemas.deals.read crm.schemas.deals.write crm.objects.deals.read crm.objects.deals.write crm.objects.companies.read crm.objects.companies.write crm.objects.owners.read settings.users.read settings.users.write settings.users.teams.read settings.users.teams.write',
      authBaseUrl: 'https://app-eu1.hubspot.com/oauth/authorize',
      logoPath: "https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png",
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.hubapi.com',
      customPropertiesUrl: '/properties/v1/contacts/properties',
    },
    'attio': {
      clientId: '86cbbd35-e067-4353-940b-5abcdcb539dd',
      scopes: 'record_permission:read',
      authBaseUrl: 'https://app.attio.com/authorize',
      logoPath: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJWZsShi0G6mZ451MngEvQrmJ2JIGH-AF8JyFU-q-n3w&s",
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://developers.attio.com',
      customPropertiesUrl: '/docs/standard-objects-people'
    },
    'zoho': {
      clientId: '1000.CWBWAO0XK6QNROXMA2Y0RUZYMGJIGT',
      scopes: 'ZohoCRM.modules.ALL',
      authBaseUrl: 'https://accounts.zoho.eu/oauth/v2/auth',
      logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://www.zohoapis.eu/crm/v3',
      customPropertiesUrl: '/settings/fields?module=Contact'
    },
    'pipedrive': {
      clientId: '8a60094f9108f085',
      scopes: 'Pipedrive_Scope',
      authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
      logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.pipedrive.com',
      customPropertiesUrl: '/v1/personFields'
    },
    'freshsales': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'zendesk': {
      clientId: 'fbb3125a89f366daf02c09f201522245c4453c1310f07ec2223c614fac130c78',
      scopes: 'read write',
      authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.getbase.com/v2',
      customPropertiesUrl: '/contact/custom_fields'
    },
    'accelo': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'active-campaign': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'affinity': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'capsule': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'close': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'copper': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'insightly': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'keap': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'microsoft-dynamics-sales': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'nutshell': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'pipeliner': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'salesflare': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'salesforce': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sugarcrm': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'teamleader': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'teamwork': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'vtiger': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'twenty': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  'ticketing': {
    'front': {
      clientId: '5f1d8d963c77285f339a',
      scopes: '',
      authBaseUrl: 'https://app.frontapp.com/oauth/authorize',
      logoPath: 'https://i.pinimg.com/originals/43/a2/43/43a24316bd773798c7638ad98521eb81.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      apiUrl: 'https://api2.frontapp.com'
    },
    'zendesk_tcg': {
      clientId: 'panora_bbb',
      scopes: 'read write',
      authBaseUrl: 'https://panora7548.zendesk.com/oauth/authorizations/new',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      apiUrl: '/api/v2'
    },
    'gorgias': {
      clientId: '',
      scopes: 'write:all openid email profile offline',
      authBaseUrl: 'https://panora.gorgias.com/oauth/authorize',
      logoPath: 'https://x5h8w2v3.rocketcdn.me/wp-content/uploads/2020/09/FS-AFFI-00660Gorgias.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      apiUrl: '/api'
    },
    'jira': {
      clientId: '1Xy0XSajM28HG7n9gufEyU0RO72SqEHW',
      scopes: 'read:jira-work manage:jira-project manage:jira-data-provider manage:jira-webhook write:jira-work manage:jira-configuration read:jira-user offline_access',
      authBaseUrl: 'https://auth.atlassian.com/authorize',
      logoPath: 'https://logowik.com/content/uploads/images/jira3124.jpg',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      apiUrl: '/rest/api/3'
    },
    'jira_service_mgmt': {
      clientId: '1Xy0XSajM28HG7n9gufEyU0RO72SqEHW',
      scopes: 'read:servicedesk-request manage:servicedesk-customer read:servicemanagement-insight-objects write:servicedesk-request offline_access',
      authBaseUrl: 'https://auth.atlassian.com/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'linear': {
      clientId: '',
      scopes: 'read,write',
      authBaseUrl: 'https://linear.app/oauth/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'gitlab': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://gitlab.example.com/oauth/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'clickup': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://app.clickup.com/api',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRewJj9y5yKzSCf-qGgjmdLagEhxfnlZ7TUsvukbfZaIg&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'github': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'aha': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'asana': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'azure': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'basecamp': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'bitbucket': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'dixa': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'freshdesk': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'freshservice': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'gladly': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'height': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'help-scout': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'hive': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'intercom': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'ironclad': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'kustomer': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'pivotal-tracker': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'rally': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'reamaze': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'salesforce': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'servicenow': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'shortcut': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'spotdraft': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'teamwork': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'trello': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'wrike': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'zoho-bugtracker': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'zoho-desk': {
      clientId: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
  },
  'accounting': {
    'pennylane': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://cdn-images-1.medium.com/max/1200/1*wk7CNGik_1Szbt7s1fNZxA.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freshbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clearbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/icon/clear-books-icon-cmyk.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freeagent': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU-fob0b9pBNQdm80usnYa2yWdagm3eeBDH-870vSmfg&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Sage_Group_logo_2022.svg/2560px-Sage_Group_logo_2022.svg.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage-intacct': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'microsoft-dynamics': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'moneybird': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'netsuite': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'quickbooks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workday': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'wave-financial': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  'marketing-automation': {
    'active-campaign': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'customerio': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'getresponse': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hubspot-marketing-hub': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'keap': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'klaviyo': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'mailchimp': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'messagebird': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'podium': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sendgrid': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sendinblue': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  'ats': {
    'applicantstack': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ashby': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'bamboohr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'breezy': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'bullhorn': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'cats': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clayhr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clockwork': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'comeet': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'cornerstone-talentlink': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'engage-ats': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'eploy': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'fountain': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freshteam': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'greenhouse': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'greenhouse-job-boards': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'harbour-ats': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'homerun': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hrcloud': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'icims': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'infinite-brassring': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jazzhr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jobadder': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jobscore': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jobvite': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lano': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lever': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'occupop': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oracle-fusion': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oracle-taleo': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'personio-recruiting': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'pinpoint': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'polymer': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'recruiterflow': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'recruitive': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage-hr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sap-successfactors': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'smartrecruiters': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'talentlyft': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'talentreef': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'teamtailor': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'tellent': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'tribepad': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg-pro-recruiting': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workable': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workday': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'zoho-recruit': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  'hris': {
    '7shifts': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'adp-workforce-now': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'alexishr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'alliancehcm': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'altera-payroll': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'bamboohr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'breathe': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ceridian-dayforce': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'charlie': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'charthop': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clayhr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'cyberark': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'deel': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'employment-hero': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'factorial': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freshteam': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'google-workspace': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'gusto': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hibob': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hrcloud': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hrpartner': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'humaans': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'humi': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'insperity-premier': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'active-campaign': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'intellli-hr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'iris-cascade': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jumpcloud': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'justworks': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'kallidus': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'keka': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'kenjo': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lano': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lucca': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'microsoft-entra-id': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'namely': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'nmbrs': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'officient': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'okta': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'onelogin': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oracle-hcm': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oyster-hr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paycaptain': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paychex': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paycor': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'payfit': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paylocity': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'people-hr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'personio': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'pingone': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'proliant': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'remote': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage-hr': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sap-successfactors': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sesame': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'square-payroll': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'trinet': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'trinet-hr-platform': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg-pro': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg-pro-workforce': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg-ready': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workday': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'zoho-people': {
      clientId: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  }
};

function getActiveProvidersForVertical(vertical: string): VerticalConfig {
  const verticalConfig = providersConfig[vertical.toLowerCase()];
  if (!verticalConfig) {
    return {};
  }

  const activeProviders: VerticalConfig = {};
  for (const [providerName, config] of Object.entries(verticalConfig)) {
    if (config.active !== false) { // Assuming undefined or true means active
      activeProviders[providerName] = config;
    }
  }

  return activeProviders;
}

export const getDescription = (name: string): string | null => {
  const vertical = findProviderVertical(name);
  if (vertical == null) {
    return null;
  }
  const activeProviders = getActiveProvidersForVertical(vertical);
  const provider = activeProviders[name];
  return provider ? provider.description : null;
}

type Provider = {
  name: string;
  clientId: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
  description?: string;
};

export function providersArray(vertical: string): Provider[] {
  const activeProviders = getActiveProvidersForVertical(vertical);
  return Object.entries(activeProviders).map(([providerName, config]) => ({
      name: providerName,
      clientId: config.clientId,
      scopes: config.scopes,
      authBaseUrl: config.authBaseUrl,
      logoPath: config.logoPath,
      description: config.description,
  }));
}


export const findProviderVertical = (providerName: string): string | null => {
  for (const [vertical, providers] of Object.entries(providersConfig)) {
    if (providers.hasOwnProperty.call(providers, providerName)) {
      return vertical;
    }
  }
  return null;
};

export function findProviderByName(providerName: string): Provider | null {
  for (const vertical in providersConfig) {
    if (providersConfig.hasOwnProperty.call(providersConfig, vertical)) {
      const activeProviders = getActiveProvidersForVertical(vertical);
      if (activeProviders.hasOwnProperty.call(activeProviders, providerName)) {
        const providerDetails = activeProviders[providerName];
        return {
          name: providerName,
          ...providerDetails,
        };
      }
    }
  }
  return null;
}
