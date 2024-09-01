<div align="center">
  <h1> Panora </h1>
  <p> Open-Source Unified API </p>
</div>

![Hero](https://panora.dev/wp-content/uploads/2023/12/github-banner.png)

<div align="center">
  </br>
    <img alt="Discord" src="https://img.shields.io/discord/1038131193067077642"></img>
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/panoratech/panora?logo=github"> </img>
    <img alt="GitHub License" src="https://img.shields.io/github/license/panoratech/Panora"></img>
    <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/panoradotdev"></img>
    <img src="https://snyk.io/test/github/panoratech/Panora/badge.svg" alt="Known Vulnerabilities"></img>
  </br>
  
  <p>
    <a href="https://panora.dev">Website 🌎</a> - <a href="https://docs.panora.dev">Documentation 📖</a> - <a href="https://discord.com/invite/PH5k7gGubt">Discord 👽</a>
  </p>
</div>

# 🕹️ Try

- Prerequisite: You should have Git and Docker installed

 1. Get the code

```
  git clone https://github.com/panoratech/Panora.git
 ```

 2. Go to Panora folder

```
  cd Panora && cp .env.example .env
  ```

 3. Start

```
  docker compose -f docker-compose.source.yml up
 ```

Panora is now running!  Follow our [Quickstart Guide](https://docs.panora.dev/quick-start) to start adding integrations to your product !

See also [our selfhost guide here !](https://docs.panora.dev/open-source/selfhost/self-host-guide)

# ✨ Core Features  

|                    |
|---------------------------|
| **Magic Links:** Let your users grant you access to their data. Without writing code.              |
| **Custom Fields:** Reflect in Panora the specific data points that matter to your users            |
| **Passthrough Requests:** Interact with other software platforms in their native format.      |
| **Webhooks:** Listen to one webhook to receive normalized data from various software platforms                  |

# ✨ Integrations Catalog

Panora supports integration with the following objects across multiple platforms:

[Here is an extensive list of all integrations !](https://docs.panora.dev/integrations-catalog)

### CRM Unified API

|                                               | Contacts | Deals | Notes | Engagements | Tasks | Users | Companies | Stage |
|-----------------------------------------------|:--------:|:-----:|:-----:|:-----------:|:-----:|:-----:|:---------:|:---------:|
| Hubspot           |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           | ✔️ |
| Pipedrive       |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           |✔️ |
| Zoho CRM          |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           | |
| Zendesk Sell |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           | ✔️|
| Attio                   |    ✔️    |      ✔️   |    ✔️    |             |   ✔️     |     ✔️   |     ✔️    |  ✔️ |
| Close                   |    ✔️    |    ✔️    |  ✔️      |    ✔️          |   ✔️    |   ✔️     |     ✔️    |✔️ |

### Ticketing Unified API

|    | Tickets | Comments | Users | Contacts | Accounts | Tags | Teams | Collections |
|-------------|:----------:|:-------:|:-------:|:------------:|:-------:|:-------:|:------:|:-------------:|
| Zendesk     | ✔        | ✔     | ✔    | ✔          | ✔    | ✔    | ✔ |  |
| Front       | ✔        | ✔     | ✔    | ✔          | ✔    | ✔    | ✔ |  |
| Jira        | ✔        | ✔     | ✔    |            |      | ✔    | ✔ | ✔ |
| Gitlab     | ✔        | ✔     | ✔    |           |      |     |  |  ✔|
| Github     | ✔        | ✔     | ✔    |       ✔    |   ✔   |  ✔   |  ✔|  |

### ATS Unified API (New!)

|             | Activities | Applications | Candidates | Departments | Interviews | Jobs | Offers | Offices | Scorecard | Users | Eeocs | Job Interview Stage | Tags | Reject Reasons |
|-------------|:----------:|:------------:|:----------:|:-----------:|:----------:|:----:|:------:|:-------:|:---------:|:-----:|:-------:|:-------:|:-------:|:-------:|
| Ashby       | ✔          | ✔            | ✔          | ✔           | ✔          | ✔    | ✔      | ✔       |         | ✔     | | ✔| ✔| |

### HRIS Unified API (New!)

|             | Bankinfos | Benefits | Companies | Dependents | Employee | Employee Payroll Runs | Employer Benefits | Employments | Groups | Locations | Paygroups | Payrollrun | Timeoff | Timeoff Balances | Timesheet Entries |
|-------------|:----------:|:------------:|:----------:|:-----------:|:----------:|:----:|:------:|:-------:|:---------:|:-----:|:-----:|:-----:|:-----:|:-----:| :-----:|
| Gusto       |           | ✔            | ✔          |            | ✔          |    | ✔      | ✔       | ✔         | ✔     | | | | | |

### File Storage Unified API

|                                           | Drives | Files | Folders | Groups | Users | Permissions | Shared Links |
|-----------------------------------------------|:--------:|:-----:|:-----:|:-----------:|:-----:|:-----:|:---------:|
| Google Drive            |       ✔️ |  ✔️   |   ✔️  |        ✔️   | ✔️    |     |           |
| Box        |        |   ✔️   |   ✔️   |      ✔️     |  ✔️    |  ✔️   |           |
| Dropbox          |       |  ✔️   |   ✔️  | ✔️          |   ✔️  |   ✔️  |           |
| OneDrive |      ✔️ | ✔️   |    ✔️|      ✔️  |   ✔️  |     |           |

### Ecommerce Unified API

|                                           | Customers | Orders | Fulfillments | Fulfillment Orders | Products |
|-----------------------------------------------|:--------:|:-----:|:-----:|:-----------:|:-----:|
| Amazon            |       ✔️ |  ✔️   |     |          |    |
| Shopify        |     ✔️   |   ✔️   |   ✔️   |      ✔️     |  ✔️    |
| Squarespace          |    ✔️   |  ✔️   |     |          |   ✔️  |
| Woocommerce |      ✔️ | ✔️   |    |        |   ✔️  |

Your favourite software is missing? [Ask the community to build a connector!](https://github.com/panoratech/Panora/issues/new)

# 🚢 Roadmap

## 🧠 Retrieval Engine for RAG

- [ ] Access and manage data from any source, including documents, chunk & vectors
- [ ] Semantic, keyword and hybrid search against a vector database
  
## 🪄 Integrations Coming Soon

#### CRM

- [x] Microsoft Dynamics 365
- [x] Linear
- [x] Redtail CRM
- [x] Wealthbox
- [x] Leadsquared
- [ ] Salesforce
- [ ] Affinity CRM
- [ ] Odoo
- [ ] Intelliflow
- [ ] Xplan
- [ ] Plannr
- [ ] ACT!
- [ ] Jungo
- [ ] Surefire
- [ ] Velocity

#### Ticketing

- [ ] Service Now
- [ ] Wrike
- [ ] Dixa
- [ ] Service Now
- [ ] Asana
- [ ] Aha
- [ ] Clickup

#### Accounting

- [ ] Wave Financial
- [ ] Xero
- [ ] Quickbooks

#### File Storage

- [ ] Google Drive
- [ ] Dropbox
- [ ] Sharepoint
- [ ] One Drive
  
#### Productivity

- [ ] Slack
- [ ] Notion

#### HRIS

- [ ] Workday
- [ ] ADP Workforce
- [x] Sage
- [x] Deel
- [ ] BambooHR
- [ ] Rippling

#### Ecommerce

- [ ] Ebay
- [ ] Faire
- [x] Webflow
- [ ] Mercado Libre
- [ ] Prestashop
- [ ] Magento
- [ ] BigCommerce

#### ATS

- [ ] Greenhouse
- [ ] Lever
- [ ] Avature

#### Cybersecurity

- [ ] Snyk
- [ ] Qualys
- [ ] Crowdstrike
- [ ] Semgrep
- [ ] Rapids7InsightVm
- [ ] Tenable
- [ ] SentinelOne
- [ ] Microsoft Defender

#### Legacy Softwares

- [ ] Netsuite (Accounting)
- [ ] SAP (ERP)
- [ ] Ariba
- [ ] Concur
- [ ] Magaya (TMS)
- [ ] Cargowise (TMS)

# 👾 Join the community

- [Join the Discord](https://discord.com/invite/PH5k7gGubt)

# 🤔 Questions? Ask the core team

<a href="https://cal.com/rflih/30?utm_source=github&utm_campaign=readme"><img alt="Book us with Cal.com" src="https://cal.com/book-with-cal-dark.svg" /></a>

# 🚀 Contributors

<a href="https://github.com/panoratech/Panora/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=panoratech/Panora" />
</a>

Want to contribute? Visit our [guide](https://docs.panora.dev/open-source/contributors#setup-your-environnement) or check our detailed integrations guide [here.](https://github.com/panoratech/Panora/blob/main/INTEGRATIONS.md)

Our [guidelines.](https://github.com/panoratech/Panora/blob/main/CONTRIBUTING.md)

<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=3be49a98-8805-45ca-bd15-99f5321ec235" />
