import { FirebaseError } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth"

import { auth } from "@/lib/firebase/client"
import { db } from "@/lib/firebase/client"
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore"

export interface UserProfile {
  uid: string
  displayName: string
  address: string
  email: string
  photoURL: string | null
  createdAt: Date
  updatedAt: Date
}

export async function signInWithEmailPassword(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account",
  })

  return signInWithPopup(auth, provider)
}

export async function signOutUser() {
  return signOut(auth)
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential
}

export function getFirebaseAuthErrorMessage(
  error: unknown,
  mode: "signin" | "signup" = "signin"
) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return mode === "signup"
          ? "Email hoặc mật khẩu không hợp lệ."
          : "Email hoặc mật khẩu không đúng."
      case "auth/invalid-email":
        return "Email không hợp lệ."
      case "auth/email-already-in-use":
        return "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác."
      case "auth/weak-password":
        return "Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự."
      case "auth/too-many-requests":
        return "Thao tác thất bại quá nhiều lần. Vui lòng thử lại sau."
      case "auth/network-request-failed":
        return "Không thể kết nối Firebase. Vui lòng kiểm tra mạng và thử lại."
      case "auth/popup-closed-by-user":
        return "Đăng nhập bằng Google đã bị hủy."
      case "auth/popup-blocked":
        return "Trình duyệt đang chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup và thử lại."
      case "auth/user-mismatch":
        return "Xác thực thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại."
      case "auth/user-not-found":
        return "Không tìm thấy tài khoản với email này."
      case "auth/requires-recent-login":
        return "Vui lòng đăng nhập lại trước khi thực hiện thao tác này."
      case "auth/account-exists-with-different-credential":
        return "Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng cách đó trước."
      default:
        return mode === "signup"
          ? "Không thể đăng ký. Vui lòng thử lại."
          : "Không thể đăng nhập. Vui lòng thử lại."
    }
  }

  return mode === "signup"
    ? "Không thể đăng ký. Vui lòng thử lại."
    : "Không thể đăng nhập. Vui lòng thử lại."
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error("auth/no-current-user")

  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function updateDisplayName(displayName: string) {
  const user = auth.currentUser
  if (!user) throw new Error("auth/no-current-user")

  await updateProfile(user, { displayName })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export interface UserNotifications {
  emailSecurity: boolean
  emailUpdates: boolean
  emailMarketing: boolean
  pushMessages: boolean
  pushMentions: boolean
  pushTasks: boolean
  emailFrequency: string
  quietHoursStart: string
  quietHoursEnd: string
  channelEmail: boolean
  channelPush: boolean
  channelSms: boolean
  orderUpdatesEmail: boolean
  orderUpdatesBrowser: boolean
  orderUpdatesApp: boolean
  invoiceRemindersEmail: boolean
  invoiceRemindersBrowser: boolean
  invoiceRemindersApp: boolean
  promotionalOffersEmail: boolean
  promotionalOffersBrowser: boolean
  promotionalOffersApp: boolean
  systemMaintenanceEmail: boolean
  systemMaintenanceBrowser: boolean
  systemMaintenanceApp: boolean
  notificationTiming: string
}

export async function getUserNotifications(
  uid: string
): Promise<UserNotifications | null> {
  const snap = await getDoc(doc(db, "users", uid))
  if (!snap.exists()) return null
  const data = snap.data() as Partial<
    UserProfile & { notifications: UserNotifications }
  >
  return data.notifications ?? null
}

export async function saveUserNotifications(notifications: UserNotifications) {
  const user = auth.currentUser
  if (!user) throw new Error("auth/no-current-user")

  await setDoc(doc(db, "users", user.uid), { notifications }, { merge: true })
}

export async function saveUserProfile(data: {
  displayName: string
  address: string
  email: string
}) {
  const user = auth.currentUser
  if (!user) throw new Error("auth/no-current-user")

  const profile: UserProfile = {
    uid: user.uid,
    displayName: data.displayName,
    address: data.address,
    email: data.email,
    photoURL: user.photoURL,
    createdAt: user.metadata.creationTime
      ? new Date(user.metadata.creationTime)
      : new Date(),
    updatedAt: new Date(),
  }

  await setDoc(doc(db, "users", user.uid), profile, { merge: true })
}

export async function deleteUserAccount(currentPassword: string) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error("auth/no-current-user")

  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)

  // Delete user data from Firestore collections
  const collections = ["tasks", "conversations", "messages"]
  for (const col of collections) {
    const q = query(collection(db, col), where("userId", "==", user.uid))
    const snapshot = await getDocs(q)
    await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, col, d.id))))
  }

  await deleteUser(user)
}
