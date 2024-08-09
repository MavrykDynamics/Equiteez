export function formatToNumber(x: string) {
  // Remove all characters except digits and the first decimal point
  const cleanedValue = x.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

  // Ensure the cleaned value can be parsed into a float
  const numberValue = parseFloat(cleanedValue);

  // If the cleaned value ends with a dot, it's valid as a decimal input
  if (cleanedValue.endsWith('.')) {
    return cleanedValue;
  }

  // If the number is valid, format it to up to 6 decimal places
  if (!isNaN(numberValue)) {
    return parseFloat(numberValue.toFixed(2)).toString();
  }

  // Return an empty string if the cleaned value cannot be parsed
  return '';
}
