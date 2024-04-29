import { Address } from '@crm/@utils/@types';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';

// OpenAIApi initialization
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

export function normalizeAddresses(addresses: Address[]) {
  const normalizedAddresses = addresses.map((addy) => ({
    ...addy,
    created_at: new Date(),
    modified_at: new Date(),
    id_crm_address: uuidv4(),
    owner_type: addy.owner_type ? addy.owner_type : '',
    address_type: addy.address_type === '' ? 'primary' : addy.address_type,
  }));

  return normalizedAddresses;
}

//These arrays are to maintain the history of the conversation
const conversationContext = [];
const currentMessages = [];

export async function mapCompanyIndustryToRemote(
  unified_industry_value: string,
  provider_name: string,
) {
  //call gpt 3.5 to associate the closest industry value based on provider api defined value
  // for instance hubspot has 150 pre-defined values for industry field, we want gpt to give us the mapping
  try {
    switch (provider_name.toLowerCase()) {
      case 'hubspot':
        return await Hubspot_mapCompanyIndustryToRemote(unified_industry_value);
      default:
        throw new Error('provider not supported for custom industry mapping');
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function Hubspot_mapCompanyIndustryToRemote(
  unified_industry_value: string,
) {
  try {
    const prompt = `I have a value which defines an industry of a company. 
    This is someone's input and I'd love to get the closest value of this input from the following list.
    Here are the 150 pre-defined values of the list. \n
    ACCOUNTING\n
    AIRLINES_AVIATION\n
    ALTERNATIVE_DISPUTE_RESOLUTION\n
    ALTERNATIVE_MEDICINE\n
    ANIMATION\n
    APPAREL_FASHION\n
    ARCHITECTURE_PLANNING\n
    ARTS_AND_CRAFTS\n
    AUTOMOTIVE\n
    AVIATION_AEROSPACE\n
    BANKING\n
    BIOTECHNOLOGY\n
    BROADCAST_MEDIA\n
    BUILDING_MATERIALS\n
    BUSINESS_SUPPLIES_AND_EQUIPMENT\n
    CAPITAL_MARKETS\n
    CHEMICALS\n
    CIVIC_SOCIAL_ORGANIZATION\n
    CIVIL_ENGINEERING\n
    COMMERCIAL_REAL_ESTATE\n
    COMPUTER_NETWORK_SECURITY\n
    COMPUTER_GAMES\n
    COMPUTER_HARDWARE\n
    COMPUTER_NETWORKING\n
    COMPUTER_SOFTWARE\n
    INTERNET\n
    CONSTRUCTION\n
    CONSUMER_ELECTRONICS\n
    CONSUMER_GOODS\n
    CONSUMER_SERVICES\n
    COSMETICS\n
    DAIRY\n
    DEFENSE_SPACE\n
    DESIGN\n
    EDUCATION_MANAGEMENT\n
    E_LEARNING\n
    ELECTRICAL_ELECTRONIC_MANUFACTURING\n
    ENTERTAINMENT\n
    ENVIRONMENTAL_SERVICES\n
    EVENTS_SERVICES\n
    EXECUTIVE_OFFICE\n
    FACILITIES_SERVICES\n
    FARMING\n
    FINANCIAL_SERVICES\n
    FINE_ART\n
    FISHERY\n
    FOOD_BEVERAGES\n
    FOOD_PRODUCTION\n
    FUND_RAISING\n
    FURNITURE\n
    GAMBLING_CASINOS\n
    GLASS_CERAMICS_CONCRETE\n
    GOVERNMENT_ADMINISTRATION\n
    GOVERNMENT_RELATIONS\n
    GRAPHIC_DESIGN\n
    HEALTH_WELLNESS_AND_FITNESS\n
    HIGHER_EDUCATION\n
    HOSPITAL_HEALTH_CARE\n
    HOSPITALITY\n
    HUMAN_RESOURCES\n
    IMPORT_AND_EXPORT\n
    INDIVIDUAL_FAMILY_SERVICES\n
    INDUSTRIAL_AUTOMATION\n
    INFORMATION_SERVICES\n
    INFORMATION_TECHNOLOGY_AND_SERVICES\n
    INSURANCE\n
    INTERNATIONAL_AFFAIRS\n
    INTERNATIONAL_TRADE_AND_DEVELOPMENT\n
    INVESTMENT_BANKING\n
    INVESTMENT_MANAGEMENT\n
    JUDICIARY\n
    LAW_ENFORCEMENT\n
    LAW_PRACTICE\n
    LEGAL_SERVICES\n
    LEGISLATIVE_OFFICE\n
    LEISURE_TRAVEL_TOURISM\n
    LIBRARIES\n
    LOGISTICS_AND_SUPPLY_CHAIN\n
    LUXURY_GOODS_JEWELRY\n
    MACHINERY\n
    MANAGEMENT_CONSULTING\n
    MARITIME\n
    MARKET_RESEARCH\n
    MARKETING_AND_ADVERTISING\n
    MECHANICAL_OR_INDUSTRIAL_ENGINEERING\n
    MEDIA_PRODUCTION\n
    MEDICAL_DEVICES\n
    MEDICAL_PRACTICE\n
    MENTAL_HEALTH_CARE\n
    MILITARY\n
    MINING_METALS\n
    MOTION_PICTURES_AND_FILM\n
    MUSEUMS_AND_INSTITUTIONS\n
    MUSIC\n
    NANOTECHNOLOGY\n
    NEWSPAPERS\n
    NON_PROFIT_ORGANIZATION_MANAGEMENT\n
    OIL_ENERGY\n
    ONLINE_MEDIA\n
    OUTSOURCING_OFFSHORING\n
    PACKAGE_FREIGHT_DELIVERY\n
    PACKAGING_AND_CONTAINERS\n
    PAPER_FOREST_PRODUCTS\n
    PERFORMING_ARTS\n
    PHARMACEUTICALS\n
    PHILANTHROPY\n
    PHOTOGRAPHY\n
    PLASTICS\n
    POLITICAL_ORGANIZATION\n
    PRIMARY_SECONDARY_EDUCATION\n
    PRINTING\n
    PROFESSIONAL_TRAINING_COACHING\n
    PROGRAM_DEVELOPMENT\n
    PUBLIC_POLICY\n
    PUBLIC_RELATIONS_AND_COMMUNICATIONS\n
    PUBLIC_SAFETY\n
    PUBLISHING\n
    RAILROAD_MANUFACTURE\n
    RANCHING\n
    REAL_ESTATE\n
    RECREATIONAL_FACILITIES_AND_SERVICES\n
    RELIGIOUS_INSTITUTIONS\n
    RENEWABLES_ENVIRONMENT\n
    RESEARCH\n
    RESTAURANTS\n
    RETAIL\n
    SECURITY_AND_INVESTIGATIONS\n
    SEMICONDUCTORS\n
    SHIPBUILDING\n
    SPORTING_GOODS\n
    SPORTS\n
    STAFFING_AND_RECRUITING\n
    SUPERMARKETS\n
    TELECOMMUNICATIONS\n
    TEXTILES\n
    THINK_TANKS\n
    TOBACCO\n
    TRANSLATION_AND_LOCALIZATION\n
    TRANSPORTATION_TRUCKING_RAILROAD\n
    UTILITIES\n
    VENTURE_CAPITAL_PRIVATE_EQUITY\n
    VETERINARY\n
    WAREHOUSING\n
    WHOLESALE\n
    WINE_AND_SPIRITS\n
    WIRELESS\n
    WRITING_AND_EDITING\n
    I want you to just return 1 word amongst this huge list which is closest to the input I'm giving you : ${unified_industry_value}\n
    I repeat, you MUST answer just the right word, don't do any sentence.
    `;
    const modelId = 'gpt-3.5-turbo';
    const promptText = `${prompt}\n\nResponse:`;

    // Restore the previous context
    for (const [inputText, responseText] of conversationContext) {
      currentMessages.push({ role: 'user', content: inputText });
      currentMessages.push({ role: 'assistant', content: responseText });
    }

    // Stores the new message
    currentMessages.push({ role: 'user', content: promptText });

    const result = await openai.chat.completions.create({
      model: modelId,
      messages: currentMessages,
    });

    const responseText = result.choices.shift().message.content;
    conversationContext.push([promptText, responseText]);
    return responseText;
  } catch (error) {}
}
