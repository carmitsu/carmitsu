import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validators';
import { logger } from '@/lib/logger';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(clientIp)) {
    logger.warn('Przekroczono limit zapytań formularza kontaktowego', { ip: clientIp });
    return NextResponse.json(
      { status: 'Too many requests' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'Validation error',
        errors: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 }
    );
  }

  const { name, email, phone, vin, registration, message, website } = parsed.data;

  // Honeypot: bots fill hidden field; return 200 without sending email
  if (website && website.trim().length > 0) {
    logger.info('Zablokowano zgłoszenie spamowe (honeypot)', { ip: clientIp });
    return NextResponse.json({ status: 'Message sent successfully' }, { status: 200 });
  }

  const domain = process.env.MAILGUN_DOMAIN || '';
  const apiKey = process.env.MAILGUN_API_KEY || '';
  const recipient = process.env.MAILGUN_EMAIL || '';

  if (!domain || !apiKey || !recipient) {
    logger.error('Brak konfiguracji Mailgun w zmiennych środowiskowych');
    return NextResponse.json({ status: 'Message failed to send' }, { status: 500 });
  }

  const date = new Date().toLocaleString('pl-PL');
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: 'api', key: apiKey });

  const messageData = {
    from: `CarMitsu Contact <noreply@${domain}>`,
    to: [recipient],
    'h:Reply-To': email,
    subject: `Message from ${name}`,
    text: [
      `Date: ${date}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'N/A'}`,
      `VIN: ${vin || 'N/A'}`,
      `Registration: ${registration || 'N/A'}`,
      `Message: ${message}`,
    ].join('\n'),
  };

  try {
    await mg.messages.create(domain, messageData);
    logger.info('Wiadomość z formularza kontaktowego wysłana');
    return NextResponse.json({ status: 'Message sent successfully' }, { status: 200 });
  } catch (err) {
    logger.error('Błąd wysyłania wiadomości przez Mailgun', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ status: 'Message failed to send' }, { status: 500 });
  }
}
