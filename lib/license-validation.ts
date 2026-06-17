/**
 * Validates and sanitizes medical license numbers.
 * Supports various formats like PMDC, PMC, BDS, generic registrations, etc.
 */
export function validateLicenseNumber(input: string | undefined | null) {
  if (!input || input.trim() === "") {
    return { valid: false, error: "License number is required." };
  }

  const trimmed = input.trim();

  // Basic length constraints
  if (trimmed.length < 3) {
    return { valid: false, error: "License number is too short." };
  }
  
  if (trimmed.length > 50) {
      return { valid: false, error: "License number is too long." };
  }

  // Security checks: Reject HTML/script injection patterns, SQL strings
  const dangerousPatterns = [
    /<script.*?>/i,
    /<\/script>/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /SELECT\s+.*?\s+FROM/i,
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /<.*?>/g, // Any HTML tags
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: "Invalid characters in license number." };
    }
  }

  // Sanitize: Allow only alphanumeric, hyphens, and forward slashes. Remove everything else.
  // This helps standardize the input slightly without breaking historical formats.
  const sanitized = trimmed.replace(/[^a-zA-Z0-9\-\/]/g, "").toUpperCase();
  
  if (sanitized.length < 3) {
      return { valid: false, error: "License number must contain valid characters." }
  }

  return { valid: true, sanitized };
}
