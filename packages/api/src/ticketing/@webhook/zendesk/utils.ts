export const mapToRemoteEvent = (unified_event: string) => {
  switch (unified_event) {
    case 'ticketing.tickets.events':
      return '';
    case 'ticketing.comments.events':
      return '';
    case 'ticketing.tags.events':
      return '';
    case 'ticketing.attachments.events':
      return '';
    case 'ticketing.accounts.events':
      return [
        'zen:event-type:organization.created',
        'zen:event-type:organization.custom_field_changed',
        'zen:event-type:organization.deleted',
        'zen:event-type:organization.external_id_changed',
        'zen:event-type:organization.name_changed',
        'zen:event-type:organization.tags_changed',
      ];
    case 'ticketing.users.events':
      return [
        'zen:event-type:user.alias_changed',
        'zen:event-type:user.created',
        'zen:event-type:user.custom_field_changed',
        'zen:event-type:user.deleted',
        'zen:event-type:user.role_changed',
        'zen:event-type:user.name_changed',
        'zen:event-type:user.details_changed',
      ];
    case 'ticketing.contacts.events':
      return ['zen:event-type:user.custom_role_changed'];
  }
};
