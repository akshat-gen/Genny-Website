// Mirrors the client-side rules in client/src/lib/demoForm.ts.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FREE_EMAIL_RE = /@(gmail|yahoo|hotmail|outlook|icloud|aol|proton|protonmail)\./i;
export const SPEND_OPTIONS = ['$50M – $250M', '$250M – $1B', '$1B+'];
const MAX = { name: 100, email: 254, company: 150, spend: 40 };

// Trim and collapse whitespace (incl. line breaks, which must never reach email headers).
const str = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

export function validateDemoRequest(body) {
  const name = str(body?.name);
  const email = str(body?.email);
  const company = str(body?.company);
  const spend = str(body?.spend);

  const errors = {};
  if (name.length < 2) errors.name = 'Enter your full name.';
  else if (name.length > MAX.name) errors.name = `Use ${MAX.name} characters or fewer.`;
  if (email.length > MAX.email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  else if (FREE_EMAIL_RE.test(email)) errors.email = 'Please use your work email.';
  if (!company) errors.company = 'Enter your company name.';
  else if (company.length > MAX.company) errors.company = `Use ${MAX.company} characters or fewer.`;
  if (spend.length > MAX.spend || !SPEND_OPTIONS.includes(spend)) errors.spend = 'Choose an annual direct spend range.';

  if (Object.keys(errors).length) return { errors };
  return { data: { name, email, company, spend } };
}
