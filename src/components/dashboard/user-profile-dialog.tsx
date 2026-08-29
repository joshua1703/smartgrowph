"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";
import { useUserRole } from "@/lib/use-user-role";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user, isLoaded } = useUser();
  const { role } = useUserRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sync state with current user info
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPreviewImage(null);
    }
  }, [user, open]);

  // Handle Photo Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setIsUploadingImage(true);

    try {
      await user.setProfileImage({ file });
      // Sync to Supabase
      await fetch("/api/sync-user", { method: "POST" });
      toast.success("Profile picture updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to upload profile picture:", err);
      toast.error("Failed to upload profile picture. Please try again.");
      setPreviewImage(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      // Sync to Supabase
      await fetch("/api/sync-user", { method: "POST" });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentImageUrl = previewImage || user?.imageUrl;
  const userInitials = (
    (firstName ? firstName.slice(0, 1) : "") + (lastName ? lastName.slice(0, 1) : "") ||
    user?.fullName?.slice(0, 2) ||
    "SG"
  ).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-extrabold text-foreground">
            Account & Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            View and update your operator profile picture and personal details.
          </DialogDescription>
        </DialogHeader>

        {/* ── User Identity Banner with Clickable Avatar Upload ── */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
          
          {/* Avatar with Clickable Camera Overlay */}
          <div className="relative shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
              aria-label="Upload profile photo"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="group relative flex size-14 cursor-pointer items-center justify-center rounded-full outline-hidden ring-2 ring-primary/30 transition-all hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary"
              title="Click photo to change profile picture"
            >
              <Avatar className="size-14 border-2 border-background shadow-xs">
                {currentImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImageUrl}
                    alt={user?.fullName || "User"}
                    className="size-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-bold text-white">
                    {userInitials}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Hover / Loading Overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {isUploadingImage ? (
                  <Loader2 className="size-5 text-white animate-spin" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </div>

              {/* Camera Badge Bottom Right */}
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                {isUploadingImage ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Camera className="size-3" />
                )}
              </span>
            </button>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-bold text-foreground">
              {user?.fullName || "SmartGrow Operator"}
            </p>
            <p className="truncate text-xs text-muted-foreground font-mono">
              {user?.primaryEmailAddress?.emailAddress || "Google Account"}
            </p>
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              <span className="uppercase">Google SSO Authenticated · {role}</span>
            </div>
          </div>
        </div>

        {/* ── Profile Edit Form (Clean First Name & Last Name) ── */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-semibold text-foreground">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="h-10 rounded-xl text-xs"
                disabled={!isLoaded || isSaving || isUploadingImage}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-semibold text-foreground">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="h-10 rounded-xl text-xs"
                disabled={!isLoaded || isSaving || isUploadingImage}
              />
            </div>
          </div>

          {/* ── Actions Footer ── */}
          <div className="pt-3 grid grid-cols-2 gap-3 border-t border-border/80 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 w-full rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !isLoaded || isUploadingImage}
              className="h-10 w-full rounded-xl text-xs font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
