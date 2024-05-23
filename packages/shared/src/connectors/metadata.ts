// If authBaseUrl or apiUrl both start with / it means a subdomain is likely needed
// If authBaseUrl is blank then it must be manually built in the client given the provider (meaning its not deterministic)

import { AuthStrategy, ProvidersConfig } from '../types';

export const CONNECTORS_METADATA: ProvidersConfig = {
    'crm': {
      'hubspot': {
        scopes: 'crm.objects.companies.read crm.objects.companies.write crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write',
        urls: {
          docsUrl: 'https://developers.hubspot.com/docs/api/crm/understanding-the-crm',
          authBaseUrl: 'https://app-eu1.hubspot.com/oauth/authorize',
          apiUrl: 'https://api.hubapi.com/crm/v3',
          customPropertiesUrl: 'https://api.hubapi.com/properties/v1/contacts/properties',
        },
        logoPath: 'https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: AuthStrategy.oauth2
      },
      'attio': {
        scopes: 'record_permission:read',
        urls: {
          docsUrl: 'https://developers.attio.com/reference',
          authBaseUrl: 'https://app.attio.com/authorize',
          apiUrl: 'https://api.attio.com/v2',
          customPropertiesUrl: '/docs/standard-objects-people',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJWZsShi0G6mZ451MngEvQrmJ2JIGH-AF8JyFU-q-n3w&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: AuthStrategy.oauth2
      },
      'zoho': {
        scopes: 'ZohoCRM.modules.ALL',
        urls: {
          docsUrl: 'https://www.zoho.com/crm/developer/docs/api/v5/',
          authBaseUrl: '/oauth/v2/auth',
          apiUrl: '/crm/v3',
          customPropertiesUrl: '/settings/fields?module=Contact',
        },
        logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: AuthStrategy.oauth2
      },
      'pipedrive': {
        urls: {
          docsUrl: 'https://developers.pipedrive.com/docs/api/v1',
          authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
          apiUrl: 'https://api.pipedrive.com/v1',
          customPropertiesUrl: '/v1/personFields',
        },
        logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'freshsales': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'zendesk': {
        scopes: 'read write',
        urls: {
          docsUrl: 'https://developer.zendesk.com/api-reference/sales-crm/introduction/',
          authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
          apiUrl: 'https://api.getbase.com/v2',
          customPropertiesUrl: '/contact/custom_fields',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: AuthStrategy.oauth2,
      },
      'accelo': {
        scopes: '',
        urls: {
          docsUrl: 'https://api.accelo.com/docs/#introduction',
          authBaseUrl: '/oauth2/v0/authorize',
          apiUrl: '/api/v0',
        },
        logoPath: 'https://play-lh.googleusercontent.com/j63K2u8ZXukgPs8QPgyXfyoxuNBl_ST7gLx5DEFeczCTtM9e5JNpDjjBy32qLxFS7p0',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'active_campaign': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.activecampaign.com/reference/overview',
          apiUrl: '/api/3',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSymrBOaXpQab_5RPRZfiOXU7h9dfsduGZeCaZZw59xJA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'affinity': {
        scopes: '',
        urls: {
          docsUrl: 'https://api-docs.affinity.co/#getting-started',
          apiUrl: 'https://api.affinity.co',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMRfcwBA9Jn9z9dJQgY3f_H-bBeUzl-jRHNOm8xrmwtA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'capsule': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.capsulecrm.com/',
          authBaseUrl: 'https://api.capsulecrm.com/oauth/authorise',
          apiUrl: 'https://api.capsulecrm.com/api/v2',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjS3qFlJJbQ802nGEV9w2GEgmnAIgJj6JJxe14cH6Wuw&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'close': {
        urls: {
          docsUrl: 'https://developer.close.com/',
          authBaseUrl: 'https://app.close.com/oauth2/authorize',
          apiUrl: 'https://api.close.com/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEH77yPBUkStmoc1ZtgJS4XeBmQiaq_Q1vgF5oerOGbg&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'copper': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.copper.com/index.html',
          authBaseUrl: 'https://app.copper.com/oauth/authorize',
          apiUrl: 'https://api.copper.com/developer_api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVa1YDciibzviRJxGovqH4gNgPxpZUAHEz36Bwnj54uQ&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'insightly': {
        scopes: '',
        urls: {
          docsUrl: 'https://api.insightly.com/v3.1/Help#!/Overview/Introduction',
          apiUrl: '/v3.1',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key,
      },
      'keap': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.infusionsoft.com/docs/restv2/',
          authBaseUrl: 'https://accounts.infusionsoft.com/app/oauth/authorize',
          apiUrl: 'https://api.infusionsoft.com/crm/rest/v2',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPYsWSMe9KVWgCIQ8fw-vBOnfTlZaSS6p_43ZhEIx51A&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'microsoft_dynamics_sales': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      // todo
      'nutshell': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.nutshell.com/',
          apiUrl: '/api/v1/json',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbCONyN9DCKfd4E8pzIdItl5VqPTEErpoEn9vHCgblRg&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.basic
      },
      // todo
      'pipeliner': {
        scopes: '',
        urls: {
          docsUrl: 'https://pipeliner.stoplight.io/docs/api-docs',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/rK9Qv_w9C8Py_aLZdQQDobNdHWSG8KL4dj3cBBQLcimVu-ctxwujA4VE442lIpZ65AE',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'salesflare': {
        scopes: '',
        urls: {
          docsUrl: 'https://api.salesflare.com/docs#section/Introduction/Getting-Started',
          apiUrl: 'https://api.salesflare.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTesqSVCSaCDrjedsKbepr14iJPySzUwrh7Fg9MhgKh9w&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'salesforce': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgL4FJb-GptGfxDDkWbIX2CjIM77t5q-d7eCFY6sGsHA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'sugarcrm': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQftNERc1ImBHm8MXXuWdhQiFYwW-dXNcogRL1UV8JyHFQGY2BbsbpwKvERwKRB39RH6zw&usqp=CAU',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'teamleader': {
        urls: {
          docsUrl: 'https://developer.teamleader.eu/#/introduction/ap-what?',
          authBaseUrl: 'https://focus.teamleader.eu/oauth2/authorize',
          apiUrl: 'https://api.focus.teamleader.eu',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE99rDOwXdRYGET0oeSCqK2kB02slJxZtTeBC79pb8IQ&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'teamwork': {
        urls: {
          docsUrl: 'https://apidocs.teamwork.com/guides/teamwork/getting-started-with-the-teamwork-com-api',
          authBaseUrl: 'https://www.teamwork.com/launchpad/login',
          apiUrl: '', // on purpose blank => everything is contained inside the accountUrl(subdomain)
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr6gYDMNagMEicBb4dhKz4BC1fQs72In45QF7Ls6-moA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'vtiger': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcUYrYD8lnaFaDN93vwjHhksKJUG3rqlb1TCFC__oPBw&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.basic
      },
      // todo
      'twenty': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
    },
    'ticketing': {
      'front': {
        urls: {
          docsUrl: 'https://dev.frontapp.com/docs/welcome',
          authBaseUrl: 'https://app.frontapp.com/oauth/authorize',
          apiUrl: 'https://api2.frontapp.com',
        },
        logoPath: 'https://i.pinimg.com/originals/43/a2/43/43a24316bd773798c7638ad98521eb81.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: AuthStrategy.oauth2
      },
      'zendesk': {
        scopes: 'read write',
        urls: {
          docsUrl: 'https://developer.zendesk.com/api-reference/sales-crm/introduction/',
          authBaseUrl: '/oauth/authorizations/new',
          apiUrl: '/api/v2',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: AuthStrategy.oauth2
      },
      'gorgias': {
        scopes: 'write:all openid email profile offline',
        urls: {
          docsUrl: 'https://developers.gorgias.com/reference/introduction',
          apiUrl: '/api',
          authBaseUrl: `/connections/gorgias/oauth/install`,
        },
        logoPath: 'https://x5h8w2v3.rocketcdn.me/wp-content/uploads/2020/09/FS-AFFI-00660Gorgias.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: AuthStrategy.oauth2
      },
      'jira': {
        scopes: 'read:jira-work manage:jira-project manage:jira-data-provider manage:jira-webhook write:jira-work manage:jira-configuration read:jira-user offline_access',
        urls: {
          docsUrl: '',
          apiUrl: '/rest/api/3',
          authBaseUrl: 'https://auth.atlassian.com/authorize',
        },
        logoPath: 'https://logowik.com/content/uploads/images/jira3124.jpg',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'jira_service_mgmt': {
        scopes: 'read:servicedesk-request manage:servicedesk-customer read:servicemanagement-insight-objects write:servicedesk-request offline_access',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: 'https://auth.atlassian.com/authorize'
        },
        logoPath: '',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'linear': {
        scopes: 'read,write',
        urls: {
          docsUrl: 'https://developers.linear.app/docs',
          apiUrl: 'https://api.linear.app/graphql',
          authBaseUrl: 'https://linear.app/oauth/authorize',
        },
        logoPath: '',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'gitlab': {
        scopes: 'api read_api read_user create_runner k8s_proxy read_repository write_repository sudo admin_mode read_service_ping openid profile email',
        urls: {
          docsUrl: 'https://docs.gitlab.com/ee/api/rest/#',
          apiUrl: 'https://gitlab.com/api/v4',
          authBaseUrl: 'https://gitlab.com/oauth/authorize',
        },
        logoPath: 'https://asset.brandfetch.io/idw382nG0m/idVn6myaqy.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: true,
        authStrategy: AuthStrategy.oauth2
      },
      'clickup': {
        urls: {
          docsUrl: 'https://clickup.com/api/',
          apiUrl: 'https://api.clickup.com/v2',
          authBaseUrl: 'https://app.clickup.com/api',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRewJj9y5yKzSCf-qGgjmdLagEhxfnlZ7TUsvukbfZaIg&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'github': {
        scopes: '',
        urls: {
          docsUrl: 'https://docs.github.com/fr/rest',
          apiUrl: 'https://api.github.com',
          authBaseUrl: 'https://github.com/login/oauth/authorize',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'aha': {
        urls: {
          docsUrl: 'https://www.aha.io/api',
          apiUrl: '/api/v1',
          authBaseUrl: '/oauth/authorize',
        },
        logoPath: 'https://www.aha.io/aha-logo-2x.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'asana': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.asana.com/docs/overview',
          apiUrl: 'https://app.asana.com/api/1.0',
          authBaseUrl: 'https://app.asana.com/-/oauth_authorize',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'azure': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'basecamp': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        }, logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'bitbucket': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        }, logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'dixa': {
        scopes: '',
        urls: {
          docsUrl: 'https://docs.dixa.io/docs/',
          apiUrl: 'https://dev.dixa.io',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'freshdesk': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'freshservice': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'gladly': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.gladly.com/rest/',
          apiUrl: '/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.basic
      },
      // todo
      'height': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'help_scout': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.helpscout.com/docs-api/',
          apiUrl: 'https://docsapi.helpscout.net/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'hive': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.hive.com/reference/introduction',
          apiUrl: 'https://app.hive.com/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'intercom': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'ironclad': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'kustomer': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.kustomer.com/kustomer-api-docs/reference/introduction',
          apiUrl: 'https://api.kustomerapp.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'pivotal_tracker': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'rally': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'reamaze': {
        scopes: '',
        urls: {
          docsUrl: 'https://www.reamaze.com/api',
          apiUrl: '/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'salesforce': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'servicenow': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'shortcut': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.shortcut.com/api/rest/v3',
          apiUrl: 'https://api.app.shortcut.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'spotdraft': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'teamwork': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      // todo
      'trello': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: 'https://api.app.shortcut.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'wrike': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.wrike.com/overview/',
          apiUrl: '/api/v4',
          authBaseUrl: 'https://login.wrike.com/oauth2/authorize/v4',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'zoho_bugtracker': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
      'zoho_desk': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
      },
    },
    'accounting': {
      'pennylane': {
        scopes: '',
        urls: {
          docsUrl: 'https://pennylane.readme.io/docs/getting-started',
          apiUrl: 'https://app.pennylane.com/api/external/v1',
          authBaseUrl: 'https://app.pennylane.com/oauth/authorize',
        },
        logoPath: 'https://cdn-images-1.medium.com/max/1200/1*wk7CNGik_1Szbt7s1fNZxA.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'freshbooks': {
        scopes: '',
        urls: {
          docsUrl: 'https://www.freshbooks.com/api/start',
          apiUrl: 'https://api.freshbooks.com',
          authBaseUrl: 'https://auth.freshbooks.com/oauth/authorize',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'clearbooks': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/icon/clear-books-icon-cmyk.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'freeagent': {
        urls: {
          docsUrl: 'https://dev.freeagent.com/docs/quick_start',
          apiUrl: 'https://api.freeagent.com/v2',
          authBaseUrl: 'https://api.freeagent.com/v2/approve_app',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU-fob0b9pBNQdm80usnYa2yWdagm3eeBDH-870vSmfg&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'sage': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.sage.com/accounting/reference/',
          apiUrl: 'https://api.accounting.sage.com/v3.1',
          authBaseUrl: 'https://www.sageone.com/oauth2/auth/central?filter=apiv3.1',
        },
        logoPath: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Sage_Group_logo_2022.svg/2560px-Sage_Group_logo_2022.svg.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'sage_intacct': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      // todo
      'microsoft_dynamics': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'moneybird': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.moneybird.com/',
          apiUrl: 'https://moneybird.com/api/v2',
          authBaseUrl: 'https://moneybird.com/oauth/authorize',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'netsuite': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'quickbooks': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.intuit.com/app/developer/qbo/docs/develop',
          apiUrl: 'https://quickbooks.api.intuit.com/v3',
          authBaseUrl: 'https://appcenter.intuit.com/connect/oauth2',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'workday': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'wave_financial': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference',
          apiUrl: 'https://gql.waveapps.com/graphql/public',
          authBaseUrl: 'https://api.waveapps.com/oauth2/authorize/',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
    },
    'marketingautomation': {
      'active_campaign': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.activecampaign.com/reference/overview',
          apiUrl: '/api/3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'customerio': {
        scopes: '',
        urls: {
          docsUrl: 'https://customer.io/docs/api/track/',
          apiUrl: 'https://track.customer.io/api/'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'getresponse': {
        urls: {
          authBaseUrl: 'https://app.getresponse.com/oauth2_authorize.html',
          docsUrl: 'https://apidocs.getresponse.com/v3',
          apiUrl: 'https://api.getresponse.com/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      // todo
      'hubspot_marketing_hub': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      // todo
      'keap': {
        scopes: '',
        urls: {
          authBaseUrl: 'https://accounts.infusionsoft.com/app/oauth/authorize',
          docsUrl: 'https://developer.infusionsoft.com/docs/rest/',
          apiUrl: 'https://api.infusionsoft.com/crm/rest/v1/account/profile'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'klaviyo': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.klaviyo.com/en/reference/api_overview',
          apiUrl: 'https://a.klaviyo.com/api'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'mailchimp': {
        scopes: '',
        urls: {
          authBaseUrl: 'https://login.mailchimp.com/oauth2/authorize',
          docsUrl: 'https://mailchimp.com/developer/marketing/api/',
          apiUrl: '' // todo
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'messagebird': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.messagebird.com/api/',
          apiUrl: 'https://rest.messagebird.com'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'podium': {
        scopes: '',
        urls: {
          authBaseUrl: 'https://api.podium.com/oauth/authorize',
          docsUrl: 'https://docs.podium.com/reference/introduction',
          apiUrl: 'https://api.podium.com/v4'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.oauth2
      },
      'sendgrid': {
        scopes: '',
        urls: {
          docsUrl: 'https://docs.sendgrid.com/for-developers/sending-email/api-getting-started',
          apiUrl: 'https://api.sendgrid.com/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'brevo': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.brevo.com/docs/getting-started',
          apiUrl: 'https://api.brevo.com/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
    },
    // todo
    'ats': {
      // todo
      'applicantstack': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'ashby': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.ashbyhq.com',
          apiUrl: 'https://api.ashbyhq.com'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'bamboohr': {
        scopes: '',
        urls: {
          docsUrl: 'https://documentation.bamboohr.com/docs/getting-started',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'breezy': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.breezy.hr/reference/overview',
          apiUrl: 'https://api.breezy.hr/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'bullhorn': {
        scopes: '',
        urls: {
          docsUrl: 'https://bullhorn.github.io/rest-api-docs/',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'cats': {
        scopes: '',
        urls: {
          docsUrl: 'https://docs.catsone.com/api/v3/',
          apiUrl: 'https://api.catsone.com/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'clayhr': {
        scopes: '',
        urls: {
          docsUrl: 'https://clayhr.readme.io/',
          apiUrl: '/rm/api/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      // todo
      'clockwork': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      // todo
      'comeet': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'cornerstone_talentlink': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.lumesse-talenthub.com/rest-api-developers-guide/1.21.33/index.html?page=rest-api&subpage=introduction',
          apiUrl: 'https://apiproxy.shared.lumessetalentlink.com/tlk/rest'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: AuthStrategy.api_key
      },
      'engage_ats': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'eploy': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'fountain': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'freshteam': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'greenhouse': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'greenhouse_job_boards': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'harbour_ats': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'homerun': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'hrcloud': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'icims': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'infinite_brassring': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'jazzhr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'jobadder': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'jobscore': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'jobvite': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'lano': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'lever': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'occupop': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'oracle_fusion': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'oracle_taleo': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'personio_recruiting': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'pinpoint': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'polymer': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'recruiterflow': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'recruitive': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'sage_hr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'sap_successfactors': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'smartrecruiters': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'talentlyft': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'talentreef': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'teamtailor': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'tellent': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'tribepad': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'ukg_pro_recruiting': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'workable': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'workday': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'zoho_recruit': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
    },
    // TODO
    'hris': {
      '7shifts': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'adp_workforce_now': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'alexishr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'alliancehcm': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'altera_payroll': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'bamboohr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'breathe': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'ceridian_dayforce': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'charlie': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'charthop': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'clayhr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'cyberark': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'deel': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'employment_hero': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'factorial': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'freshteam': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'google_workspace': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'gusto': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'hibob': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'hrcloud': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'hrpartner': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'humaans': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'humi': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'insperity_premier': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'active_campaign': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'intellli_hr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'iris_cascade': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'jumpcloud': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'justworks': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'kallidus': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'keka': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'kenjo': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'lano': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'lucca': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'microsoft_entra_id': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'namely': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'nmbrs': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'officient': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'okta': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'onelogin': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'oracle_hcm': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'oyster_hr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'paycaptain': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'paychex': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'paycor': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'payfit': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'paylocity': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'people_hr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'personio': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'pingone': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'proliant': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'remote': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'sage_hr': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'sap_successfactors': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'sesame': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'square_payroll': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'trinet': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'trinet_hr_platform': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'ukg_pro': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'ukg_pro_workforce': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'ukg_ready': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'workday': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
      'zoho_people': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
      },
    }
};
