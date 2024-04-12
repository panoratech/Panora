export enum AuthStrategy {
  oauth2,
  api_key,
  basic
}

// TODO : remove clientId
export type ProviderConfig = {
  scopes: string;
  authBaseUrl: string; //url used to authorize an application on behalf of the user (only when authStrategy is oauth2)
  logoPath: string;
  description: string;
  active?: boolean;
  apiUrl: string;
  customPropertiesUrl?: string; 
  authStrategy?: AuthStrategy;
};

type VerticalConfig = {
  [key: string]: ProviderConfig;
};

export type ProvidersConfig = {
  [vertical: string]: VerticalConfig;
}

// If authBaseUrl or apiUrl both start with / it means a subdomain is likely needed
// If authBaseUrl is blank then it must be manually built in the client given the provider (meaning its not deterministic)

export const providersConfig: ProvidersConfig = {
  'crm': {
    'hubspot': {
      scopes: 'crm.objects.contacts.read crm.objects.contacts.write crm.schemas.deals.read crm.schemas.deals.write crm.objects.deals.read crm.objects.deals.write crm.objects.companies.read crm.objects.companies.write crm.objects.owners.read settings.users.read settings.users.write settings.users.teams.read settings.users.teams.write',
      authBaseUrl: 'https://app-eu1.hubspot.com/oauth/authorize',
      logoPath: "https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png",
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.hubapi.com/crm/v3',
      customPropertiesUrl: '/properties/v1/contacts/properties',
      authStrategy: AuthStrategy.oauth2
    },
    'attio': {
      scopes: 'record_permission:read',
      authBaseUrl: 'https://app.attio.com/authorize',
      logoPath: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJWZsShi0G6mZ451MngEvQrmJ2JIGH-AF8JyFU-q-n3w&s",
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.attio.com/v2',
      customPropertiesUrl: '/docs/standard-objects-people',
      authStrategy: AuthStrategy.oauth2
    },
    'zoho': {
      scopes: 'ZohoCRM.modules.ALL',
      authBaseUrl: '/oauth/v2/auth',
      logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: '/crm/v3',
      customPropertiesUrl: '/settings/fields?module=Contact',
      authStrategy: AuthStrategy.oauth2
    },
    'pipedrive': {
      scopes: 'Pipedrive_Scope',
      authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
      logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.pipedrive.com/v1',
      customPropertiesUrl: '/v1/personFields',
      authStrategy: AuthStrategy.oauth2
    },
    'freshsales': {
      scopes: '',
      authBaseUrl: '',
      apiUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'zendesk': {
      scopes: 'read write',
      authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      apiUrl: 'https://api.getbase.com/v2',
      customPropertiesUrl: '/contact/custom_fields',
      authStrategy: AuthStrategy.oauth2
    }, 
    'accelo': {
      scopes: '',
      authBaseUrl: '/oauth2/v0/authorize', 
      apiUrl: '/api/v0',
      logoPath: 'https://play-lh.googleusercontent.com/j63K2u8ZXukgPs8QPgyXfyoxuNBl_ST7gLx5DEFeczCTtM9e5JNpDjjBy32qLxFS7p0',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'active_campaign': {
      scopes: '',
      authBaseUrl: null, 
      apiUrl: '/api/3',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSymrBOaXpQab_5RPRZfiOXU7h9dfsduGZeCaZZw59xJA&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    'affinity': {
      scopes: '',
      authBaseUrl: null,
      apiUrl: 'https://api.affinity.co',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMRfcwBA9Jn9z9dJQgY3f_H-bBeUzl-jRHNOm8xrmwtA&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    'capsule': {
      scopes: '',
      authBaseUrl: 'https://api.capsulecrm.com/oauth/authorise',
      apiUrl: 'https://api.capsulecrm.com/api/v2',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjS3qFlJJbQ802nGEV9w2GEgmnAIgJj6JJxe14cH6Wuw&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'close': {
      scopes: '',
      authBaseUrl: 'https://app.close.com/oauth2/authorize',
      apiUrl: 'https://api.close.com/api/v1',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEH77yPBUkStmoc1ZtgJS4XeBmQiaq_Q1vgF5oerOGbg&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'copper': {
      scopes: '',
      authBaseUrl: 'https://app.copper.com/oauth/authorize',
      apiUrl: 'https://api.copper.com/developer_api/v1',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVa1YDciibzviRJxGovqH4gNgPxpZUAHEz36Bwnj54uQ&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'insightly': {
      scopes: '',
      authBaseUrl: null,
      apiUrl: '/v3.1',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.api_key,
    },
    'keap': {
      scopes: '',
      authBaseUrl: 'https://accounts.infusionsoft.com/app/oauth/authorize',
      apiUrl: 'https://api.infusionsoft.com/crm/rest/v2',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPYsWSMe9KVWgCIQ8fw-vBOnfTlZaSS6p_43ZhEIx51A&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'microsoft_dynamics_sales': {
      scopes: '',
      authBaseUrl: '',
      apiUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    //todo
    'nutshell': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbCONyN9DCKfd4E8pzIdItl5VqPTEErpoEn9vHCgblRg&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.basic
    },
    //todo
    'pipeliner': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/rK9Qv_w9C8Py_aLZdQQDobNdHWSG8KL4dj3cBBQLcimVu-ctxwujA4VE442lIpZ65AE',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    'salesflare': {
      apiUrl: 'https://api.salesflare.com',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTesqSVCSaCDrjedsKbepr14iJPySzUwrh7Fg9MhgKh9w&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    //todo
    'salesforce': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgL4FJb-GptGfxDDkWbIX2CjIM77t5q-d7eCFY6sGsHA&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'sugarcrm': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQftNERc1ImBHm8MXXuWdhQiFYwW-dXNcogRL1UV8JyHFQGY2BbsbpwKvERwKRB39RH6zw&usqp=CAU',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'teamleader': {
      scopes: '',
      authBaseUrl: 'https://focus.teamleader.eu/oauth2/authorize',
      apiUrl: 'https://api.focus.teamleader.eu',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE99rDOwXdRYGET0oeSCqK2kB02slJxZtTeBC79pb8IQ&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'teamwork': {
      scopes: '',
      authBaseUrl: 'https://www.teamwork.com/launchpad/login',
      apiUrl: '', //everything is contained inside the accountUrl(subdomain)
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr6gYDMNagMEicBb4dhKz4BC1fQs72In45QF7Ls6-moA&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'vtiger': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcUYrYD8lnaFaDN93vwjHhksKJUG3rqlb1TCFC__oPBw&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.basic
    },
    //todo
    'twenty': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  'ticketing': {
    'front': {
      scopes: '',
      authBaseUrl: 'https://app.frontapp.com/oauth/authorize',
      apiUrl: 'https://api2.frontapp.com',
      logoPath: 'https://i.pinimg.com/originals/43/a2/43/43a24316bd773798c7638ad98521eb81.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      authStrategy: AuthStrategy.oauth2
    },
    'zendesk': {
      scopes: 'read write',
      authBaseUrl: '/oauth/authorizations/new',
      apiUrl: '/api/v2',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      authStrategy: AuthStrategy.oauth2
    },
    'gorgias': {
      scopes: 'write:all openid email profile offline',
      authBaseUrl: '/oauth/authorize',
      logoPath: 'https://x5h8w2v3.rocketcdn.me/wp-content/uploads/2020/09/FS-AFFI-00660Gorgias.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      apiUrl: '/api',
      authStrategy: AuthStrategy.oauth2
    },
    'jira': {
      scopes: 'read:jira-work manage:jira-project manage:jira-data-provider manage:jira-webhook write:jira-work manage:jira-configuration read:jira-user offline_access',
      authBaseUrl: 'https://auth.atlassian.com/authorize',
      logoPath: 'https://logowik.com/content/uploads/images/jira3124.jpg',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      apiUrl: '/rest/api/3',
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'jira_service_mgmt': {
      apiUrl: '',
      scopes: 'read:servicedesk-request manage:servicedesk-customer read:servicemanagement-insight-objects write:servicedesk-request offline_access',
      authBaseUrl: 'https://auth.atlassian.com/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'linear': {
      apiUrl: 'https://api.linear.app/graphql',
      scopes: 'read,write',
      authBaseUrl: 'https://linear.app/oauth/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'gitlab': {
      apiUrl: '/api/v4',
      scopes: '',
      authBaseUrl: '/oauth/authorize',
      logoPath: '',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'clickup': {
      apiUrl: 'https://api.clickup.com/v2',
      scopes: '',
      authBaseUrl: 'https://app.clickup.com/api',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRewJj9y5yKzSCf-qGgjmdLagEhxfnlZ7TUsvukbfZaIg&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'github': {
      apiUrl: 'https://api.github.com',
      scopes: '',
      authBaseUrl: 'https://github.com/login/oauth/authorize',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'aha': {
      apiUrl: '/api/v1',
      scopes: '',
      authBaseUrl: '/oauth/authorize',
      logoPath: 'https://www.aha.io/aha-logo-2x.png',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'asana': {
      apiUrl: 'https://app.asana.com/api/1.0',
      scopes: '',
      authBaseUrl: 'https://app.asana.com/-/oauth_authorize',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'azure': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'basecamp': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'bitbucket': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'dixa': {
      apiUrl: 'https://dev.dixa.io',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    //todo
    'freshdesk': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'freshservice': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'gladly': {
      apiUrl: '/api/v1',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.basic
    },
    //todo
    'height': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'help_scout': {
      apiUrl: 'https://docsapi.helpscout.net/v1',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    'hive': {
      apiUrl: 'https://app.hive.com/api/v1',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    //todo
    'intercom': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'ironclad': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    'kustomer': {
      apiUrl: 'https://api.kustomerapp.com',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    //todo
    'pivotal_tracker': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'rally': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'reamaze': {
      apiUrl: '/api/v1',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    //todo
    'salesforce': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'servicenow': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'shortcut': {
      apiUrl: 'https://api.app.shortcut.com',
      scopes: '',
      authBaseUrl: null,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.api_key
    },
    //todo
    'spotdraft': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'teamwork': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    //todo
    'trello': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'wrike': {
      apiUrl: '/api/v4',
      scopes: '',
      authBaseUrl: 'https://login.wrike.com/oauth2/authorize/v4',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'zoho_bugtracker': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
    'zoho_desk': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: 'https://api.github.com',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
      description: "Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users",
      active: false
    },
  },
  'accounting': {
    'pennylane': {
      apiUrl: 'https://app.pennylane.com/api/external/v1',
      scopes: '',
      authBaseUrl: 'https://app.pennylane.com/oauth/authorize',
      logoPath: 'https://cdn-images-1.medium.com/max/1200/1*wk7CNGik_1Szbt7s1fNZxA.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'freshbooks': {
      apiUrl: 'https://api.freshbooks.com',
      scopes: '',
      authBaseUrl: 'https://auth.freshbooks.com/oauth/authorize',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'clearbooks': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/icon/clear-books-icon-cmyk.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freeagent': {
      apiUrl: 'https://api.freeagent.com/v2',
      scopes: '',
      authBaseUrl: 'https://api.freeagent.com/v2/approve_app',
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU-fob0b9pBNQdm80usnYa2yWdagm3eeBDH-870vSmfg&s',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    'sage': {
      apiUrl: 'https://api.accounting.sage.com/v3.1',
      scopes: '',
      authBaseUrl: 'https://www.sageone.com/oauth2/auth/central?filter=apiv3.1',
      logoPath: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Sage_Group_logo_2022.svg/2560px-Sage_Group_logo_2022.svg.png',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'sage_intacct': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    //todo
    'microsoft_dynamics': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'moneybird': {
      apiUrl: 'https://moneybird.com/api/v2',
      scopes: '',
      authBaseUrl: 'https://moneybird.com/oauth/authorize',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'netsuite': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'quickbooks': {
      apiUrl: 'https://quickbooks.api.intuit.com/v3',
      scopes: '',
      authBaseUrl: 'https://appcenter.intuit.com/connect/oauth2',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
    //todo
    'workday': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'wave_financial': {
      apiUrl: 'https://gql.waveapps.com/graphql/public',
      scopes: '',
      authBaseUrl: 'https://api.waveapps.com/oauth2/authorize/',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false,
      authStrategy: AuthStrategy.oauth2
    },
  },
  //TODO
  'marketing_automation': {
    'active_campaign': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'customerio': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'getresponse': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hubspot_marketing_hub': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'keap': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'klaviyo': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'mailchimp': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'messagebird': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'podium': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sendgrid': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sendinblue': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  //TODO
  'ats': {
    'applicantstack': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ashby': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'bamboohr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'breezy': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'bullhorn': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'cats': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clayhr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clockwork': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'comeet': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'cornerstone_talentlink': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'engage_ats': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'eploy': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'fountain': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freshteam': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'greenhouse': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'greenhouse_job_boards': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'harbour_ats': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'homerun': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hrcloud': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'icims': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'infinite_brassring': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jazzhr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jobadder': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jobscore': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jobvite': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lano': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lever': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'occupop': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oracle_fusion': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oracle_taleo': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'personio_recruiting': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'pinpoint': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'polymer': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'recruiterflow': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'recruitive': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage_hr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sap_successfactors': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'smartrecruiters': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'talentlyft': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'talentreef': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'teamtailor': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'tellent': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'tribepad': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg_pro_recruiting': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workable': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workday': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'zoho_recruit': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
  },
  //TODO
  'hris': {
    '7shifts': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'adp_workforce_now': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'alexishr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'alliancehcm': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'altera_payroll': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'bamboohr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'breathe': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ceridian_dayforce': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'charlie': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'charthop': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'clayhr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'cyberark': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'deel': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'employment_hero': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'factorial': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'freshteam': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'google_workspace': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'gusto': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hibob': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hrcloud': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'hrpartner': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'humaans': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'humi': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'insperity_premier': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'active_campaign': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'intellli_hr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'iris_cascade': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'jumpcloud': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'justworks': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'kallidus': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'keka': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'kenjo': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lano': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'lucca': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'microsoft_entra_id': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'namely': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'nmbrs': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'officient': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'okta': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'onelogin': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oracle_hcm': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'oyster_hr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paycaptain': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paychex': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paycor': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'payfit': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'paylocity': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'people_hr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'personio': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'pingone': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'proliant': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'remote': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sage_hr': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sap_successfactors': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'sesame': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'square_payroll': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'trinet': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'trinet_hr_platform': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg_pro': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg_pro_workforce': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'ukg_ready': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'workday': {
      apiUrl: '',
      scopes: '',
      authBaseUrl: '',
      logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
      description: "Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users",
      active: false
    },
    'zoho_people': {
      apiUrl: '',
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
  apiUrl: string;
  scopes: string;
  authBaseUrl: string;
  logoPath: string;
  description?: string;
};

export function providersArray(vertical: string): Provider[] {
  const activeProviders = getActiveProvidersForVertical(vertical);
  return Object.entries(activeProviders).map(([providerName, config]) => ({
      name: providerName,
      apiUrl: config.apiUrl,
      scopes: config.scopes,
      authBaseUrl: config.authBaseUrl,
      logoPath: config.logoPath,
      description: config.description,
  }));
}


export const findProviderVertical = (providerName: string): string | null => {
  for (const [vertical, providers] of Object.entries(providersConfig)) {
    if (providers.hasOwnProperty.call(providers, providerName.toLowerCase())) {
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
