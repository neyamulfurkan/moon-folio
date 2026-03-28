import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactNotification = async (params: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> => {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    console.warn(
      '[resend] RESEND_API_KEY or CONTACT_EMAIL is not configured. Skipping email send.'
    );
    return { success: false, error: 'Email not configured' };
  }

  try {
    await resend.emails.send({
      from: 'noreply@moon.dev',
      to: process.env.CONTACT_EMAIL,
      subject: `New contact from ${params.name}`,
      text: `Name: ${params.name}\nEmail: ${params.email}\n\nMessage:\n${params.message}`,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[resend] Failed to send contact notification:', message);
    return { success: false, error: message };
  }
};