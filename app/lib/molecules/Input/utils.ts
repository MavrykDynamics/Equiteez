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

// TODO alter this function to work with input handlers for tokens
export function parseTokensValue(x: string, decimals: number) {
  // Remove all characters except digits and the first decimal point
  let cleanedValue = x.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

  // Split the cleaned value into integer and decimal parts
  const parts = cleanedValue.split('.');

  // If there is a decimal part, truncate it to the specified number of decimals
  if (parts.length > 1) {
    parts[1] = parts[1].slice(0, decimals);
    cleanedValue = parts.join('.');
  }

  // Ensure the cleaned value can be parsed into a float
  const numberValue = parseFloat(cleanedValue);

  // If the number is valid and not NaN
  if (!isNaN(numberValue)) {
    // Calculate the original number with the given decimals
    const originalCalculatedNumber = cleanedValue; // Keep the original string representation

    // Format the number to the specified number of decimals
    const fixedNumber = numberValue.toFixed(decimals);

    return { originalCalculatedNumber, fixedNumber };
  }

  // Return the current input if it cannot be parsed
  return { originalCalculatedNumber: cleanedValue, fixedNumber: cleanedValue };
}
