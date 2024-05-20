name: New Integration Request
about: Need an Integration that isn't in our catalog yet? Ask here!
title: Add XXXXX integration to Panora
labels: backend, embedded-catalog, good first issue
assignees: ''

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this!
  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false
  - type: dropdown
    id: vertical
    attributes:
      label: Verticals
      description: What type of software do you want to build integrations with?
      options:
        - CRM 
        - Ticketing 
        - HRIS
        - Accounting
        - Ecommerce
    validations:
      required: true
  - type: textarea
    id: platforms
    attributes:
      label: Platforms
      description: Which specific platforms would you integrate with? (ex: Salesforce, Hubspot, Jira...)