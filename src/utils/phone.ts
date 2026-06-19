const FULLWIDTH_MAP: Record<string, string> = {
  '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
  '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  '－': '-', '（': '(', '）': ')', '＋': '+', '　': ' ',
};

export function fullwidthToHalfwidth(str: string): string {
  return str.replace(/[０-９－（）＋　]/g, c => FULLWIDTH_MAP[c] || c);
}

export function normalizePhoneNumber(phone: string): string {
  let normalized = fullwidthToHalfwidth(phone);
  // Remove common non-numeric chars except + ( ) - space
  normalized = normalized.replace(/[^\d+() \-#*]/g, '');
  // Normalize spaces
  normalized = normalized.trim();
  return normalized;
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Japanese mobile: 090/080/070-XXXX-XXXX
  if (/^(090|080|070)\d{8}$/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  // Japanese landline Tokyo (03/06): 0X-XXXX-XXXX
  if (/^0[0-9]\d{8}$/.test(digits)) {
    return `0${digits[1]}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
