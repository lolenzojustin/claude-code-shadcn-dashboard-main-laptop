import { Mail } from "@/modules/mail/components/mail";
import { accounts, mails } from "@/modules/mail/services/mail-mock-data";

export default function MailPage() {
  return <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />;
}
