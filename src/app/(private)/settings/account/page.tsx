"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { auth } from "@/lib/firebase/client"
import { changePassword, deleteUserAccount, getFirebaseAuthErrorMessage, getUserProfile, saveUserProfile, updateDisplayName, type UserProfile } from "@/lib/firebase/auth"
import { onAuthStateChanged, type User } from "firebase/auth"

const accountFormSchema = z
  .object({
    displayName: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword || data.confirmPassword || data.currentPassword) {
        return data.newPassword && data.currentPassword && data.confirmPassword
      }
      return true
    },
    {
      message: "Please fill in all password fields to change your password.",
      path: ["currentPassword"],
    }
  )
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountSettings() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasPasswordProvider, setHasPasswordProvider] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const hasPassword = user.providerData.some((p) => p.providerId === "password")
        setHasPasswordProvider(hasPassword)

        form.setValue("displayName", user.displayName ?? "", { shouldValidate: true })
        form.setValue("email", user.email ?? "", { shouldValidate: true })

        const profile = await getUserProfile(user.uid)
        if (profile) {
          form.setValue("address", profile.address ?? "", { shouldValidate: true })
          setInitialProfile(profile)
        } else {
          setInitialProfile({
            uid: user.uid,
            displayName: user.displayName ?? "",
            address: "",
            email: user.email ?? "",
            photoURL: user.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [form])

  async function onSubmit(values: AccountFormValues) {
    const hasProfileChanged =
      !initialProfile ||
      values.displayName !== initialProfile.displayName ||
      (values.address ?? "") !== (initialProfile.address ?? "")

    const hasPasswordChange =
      values.currentPassword && values.newPassword && values.confirmPassword

    if (!hasProfileChanged && !hasPasswordChange) {
      toast("Không có thay đổi nào để lưu.")
      return
    }

    setIsSubmitting(true)

    try {
      if (hasProfileChanged) {
        if (values.displayName !== currentUser?.displayName) {
          await updateDisplayName(values.displayName)
        }

        await toast.promise(
          saveUserProfile({
            displayName: values.displayName,
            address: values.address ?? "",
            email: values.email,
          }),
          {
            loading: "Đang lưu thông tin...",
            success: "Lưu thông tin thành công.",
            error: (err) => getFirebaseAuthErrorMessage(err),
          }
        )

        setInitialProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName: values.displayName,
                address: values.address ?? "",
              }
            : prev
        )

        if (values.displayName !== currentUser?.displayName) {
          setCurrentUser((prev) =>
            prev ? ({ ...prev, displayName: values.displayName } as User) : prev
          )
        }
      }

      if (hasPasswordChange) {
        await toast.promise(
          changePassword(values.currentPassword!, values.newPassword!),
          {
            loading: "Đang đổi mật khẩu...",
            success: "Đổi mật khẩu thành công.",
            error: (err) => getFirebaseAuthErrorMessage(err),
          }
        )
        form.setValue("currentPassword", "")
        form.setValue("newPassword", "")
        form.setValue("confirmPassword", "")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại để xác nhận.")
      return
    }

    setIsDeleting(true)
    try {
      await toast.promise(deleteUserAccount(deletePassword), {
        loading: "Đang xóa tài khoản...",
        success: "Tài khoản đã được xóa thành công.",
        error: (err) => getFirebaseAuthErrorMessage(err),
      })
      router.push("/sign-in")
    } catch {
      // error handled by toast.promise
    } finally {
      setIsDeleting(false)
      setDeletePassword("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information that will be displayed on your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {hasPasswordProvider && (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <h4 className="font-semibold">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button" className="cursor-pointer">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3">
                          <p>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Enter your current password to confirm deletion.
                          </p>
                          <Input
                            type="password"
                            placeholder="Enter your current password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel type="button" onClick={() => setDeletePassword("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || !deletePassword}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button
              variant="outline"
              type="reset"
              onClick={() => form.reset()}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
