import { getFirestoreCollection, getFirestoreDocumentCollection } from "@/lib/firebase/firestore-query"
import { accounts, contacts, mails } from "./mail-mock-data";
import type { Contact, Mail } from "./types/mail-types";

export async function getMailData() {
  const [firestoreMails, firestoreContacts] = await Promise.all([
    getFirestoreCollection<Mail>("mails", mails),
    getFirestoreDocumentCollection<Contact>("contacts", contacts),
  ])

  return {
    accounts,
    contacts: firestoreContacts,
    mails: firestoreMails,
  }
}
