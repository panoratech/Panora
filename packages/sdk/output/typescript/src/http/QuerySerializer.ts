export type Explode = boolean;
export type QueryStyles = 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
export type PathStyles = 'simple' | 'label' | 'matrix';

const styleMethods: Record<string, Function> = {
  form: (parameterName: string, parameterValue: unknown, explode: boolean) => {
    // Check if the parameterValue is an array
    if (Array.isArray(parameterValue)) {
      return explode
        ? parameterValue.map((value) => `${parameterName}=${value}`).join('&')
        : `${parameterName}=${parameterValue.join(',')}`;
    }

    // Check if the parameterValue is an object
    if (typeof parameterValue === 'object' && parameterValue !== null) {
      if (explode) {
        // Serialize object with exploded format: "key1=value1&key2=value2"
        return Object.entries(parameterValue)
          .map(([name, value]) => `${name}=${value}`)
          .join('&');
      }
      // Serialize object with non-exploded format: "key=key1,value1,key2,value2"
      return `${parameterName}=${Object.entries(parameterValue)
        .flatMap(([name, value]) => [name, value])
        .join(',')}`;
    }

    // For primitive values
    return `${parameterName}=${parameterValue}`;
  },
};

export function serializeQuery(
  style: QueryStyles,
  explode: Explode,
  key: string,
  value: unknown,
): string {
  const method = styleMethods[style];
  if (!method) return '';
  return method(key, value, explode);
}
