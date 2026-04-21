import { Resend } from "resend";

const DEVELOPER_EMAIL = "gregthompsonnms@gmail.com";

export async function sendShowNotification(
  userEmail: string,
  showName: string,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (userEmail !== DEVELOPER_EMAIL) {
    console.log(
      `[DRY RUN] Would have sent "${showName}" notification to ${userEmail} — skipped (not verified email).`,
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: userEmail,
      subject: `New episode airing: ${showName}`,
      html: `
        <p>Hey there,</p>
        <p>A new episode of <strong>${showName}</strong> is airing today.</p>
        <p>Head over to <a href="https://media-release-radar.vercel.app">Media Release Radar</a> to check the details.</p>
        <p>— Media Release Radar</p>
      `,
    });
    console.log(`[Email] Notification sent to ${userEmail} for "${showName}".`);
  } catch (error) {
    console.error(
      `[Email] Failed to send notification to ${userEmail} for "${showName}":`,
      error,
    );
  }
}
