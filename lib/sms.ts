import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, message: string) {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.warn("Twilio environment variables are missing. Mocking SMS:");
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
    return { success: true, mocked: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error("Twilio SMS sending failed:", error);
    return { success: false, error };
  }
}
