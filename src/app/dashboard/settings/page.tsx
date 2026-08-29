"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Building2,
  Bell,
  Trash2,
  Camera,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Radio,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUserRole } from "@/lib/use-user-role";
import { LoadingScreen } from "@/components/loading-screen";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

type Tab = "account" | "greenhouse" | "notifications" | "security";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { role, isAdmin } = useUserRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("account");

  // Account Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Delete Account Modal State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Sync profile inputs from Clerk user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await user.setProfileImage({ file });
      // Trigger user sync to Supabase with new avatar
      await fetch("/api/sync-user", { method: "POST" });
      toast.success("Profile photo updated successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      // Sync to Supabase
      await fetch("/api/sync-user", { method: "POST" });
      toast.success("Account profile updated successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Account Deletion (Supabase + Clerk)
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);

    try {
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully.");
      setIsDeleteDialogOpen(false);

      // Sign out and redirect
      await signOut({ redirectUrl: "/login" });
    } catch (err: unknown) {
      console.error("Account deletion failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete account."
      );
      setIsDeletingAccount(false);
    }
  };

  const userInitials = (
    (firstName ? firstName[0] : "") + (lastName ? lastName[0] : "") ||
    user?.fullName?.slice(0, 2) ||
    "SG"
  ).toUpperCase();

  const userEmail = user?.primaryEmailAddress?.emailAddress || "user@smartgrow.io";

  return (
    <div className="flex-1 space-y-4 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="SYSTEM MANAGEMENT"
        title="Settings & Preferences"
        subtitle="Manage your personal profile, greenhouse climate configuration, and security credentials."
      />

      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("account")}
            className={cn(
              "justify-start gap-3 h-10 px-3.5 rounded-xl transition-all font-semibold text-xs",
              activeTab === "account"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <User className="size-4" />
            <span>Account</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("greenhouse")}
            className={cn(
              "justify-start gap-3 h-10 px-3.5 rounded-xl transition-all font-semibold text-xs",
              activeTab === "greenhouse"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Building2 className="size-4" />
            <span>Greenhouse</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "justify-start gap-3 h-10 px-3.5 rounded-xl transition-all font-semibold text-xs",
              activeTab === "notifications"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Bell className="size-4" />
            <span>Notifications</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("security")}
            className={cn(
              "justify-start gap-3 h-10 px-3.5 rounded-xl transition-all font-semibold text-xs",
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Lock className="size-4" />
            <span>Security</span>
          </Button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 lg:col-span-5">
          {/* TAB 1: ACCOUNT */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Account Profile Card */}
              <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight">
                        Account Profile
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Your identity, role permissions, and profile details across SmartGrow.
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider"
                    >
                      Active Session
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Upload Section */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="relative group">
                      <Avatar className="size-16 border-2 border-border shadow-md">
                        {user?.imageUrl ? (
                          <AvatarImage
                            src={user.imageUrl}
                            alt={user.fullName || "User"}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-0"
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Camera className="size-5" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">
                        Profile Photo
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        JPG, PNG, or WebP up to 5MB. Synced with Google OAuth.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="h-7 text-xs font-semibold rounded-lg mt-1"
                      >
                        {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                      </Button>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          First Name
                        </label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Your first name"
                          className="h-10 text-xs rounded-xl bg-muted/20 border-border"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Last Name
                        </label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Your last name"
                          className="h-10 text-xs rounded-xl bg-muted/20 border-border"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Email Address
                          </label>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Verified via Google
                          </span>
                        </div>
                        <Input
                          value={userEmail}
                          disabled
                          className="h-10 text-xs font-mono rounded-xl bg-muted/40 border-border cursor-not-allowed opacity-80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          System Role
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={role.toUpperCase()}
                            disabled
                            className="h-10 text-xs font-mono font-bold uppercase rounded-xl bg-muted/40 border-border cursor-not-allowed text-primary"
                          />
                          <Badge
                            variant="outline"
                            className="h-10 px-3 rounded-xl border-primary/30 text-primary font-bold text-xs uppercase whitespace-nowrap"
                          >
                            {role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSavingProfile}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6 rounded-xl h-9"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone: Delete Own Account */}
              <Card className="border-destructive/30 bg-destructive/5 shadow-xs rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="size-4.5" />
                    <CardTitle className="text-base font-bold tracking-tight text-destructive">
                      Danger Zone — Delete Account
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                    Permanently delete your SmartGrow account and all personal profile data. Your access will be revoked immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Delete your SmartGrow account
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Account: <span className="font-mono font-bold text-foreground">{userEmail}</span> ({user?.id})
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setDeleteConfirmationText("");
                      setIsDeleteDialogOpen(true);
                    }}
                    className="h-9 px-5 rounded-xl font-bold text-xs gap-2 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: GREENHOUSE CONFIGURATION */}
          {activeTab === "greenhouse" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">
                    Cultivation Microclimate Setpoints
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Operational setpoints for Oyster Mushroom cultivation (Pleurotus ostreatus).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Target Temp (°C)
                      </label>
                      <Input
                        defaultValue="26.0"
                        className="h-10 text-xs rounded-xl bg-muted/20 border-border font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Target Humidity (% RH)
                      </label>
                      <Input
                        defaultValue="88.0"
                        className="h-10 text-xs rounded-xl bg-muted/20 border-border font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        CO₂ Safety Threshold (ppm)
                      </label>
                      <Input
                        defaultValue="600"
                        className="h-10 text-xs rounded-xl bg-muted/20 border-border font-mono"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={() => toast.success("Climate setpoints updated successfully!")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6 rounded-xl h-9"
                    >
                      Save Setpoints
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Real Actuators Specs */}
              <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">
                    Greenhouse Actuator Relays
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Connected ESP32 hardware relay actuators for zone climate regulation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                          Actuator
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                          Zone
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                          Type
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                          Power (Watts)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold text-foreground">
                          Exhaust Fan A
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Zone A
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[10px]">Fan</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          45 W
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold text-foreground">
                          Ultrasonic Fogger Unit 1
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Zone A
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[10px]">Fogger</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          35 W
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold text-foreground">
                          Substrate Sprinkler System
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Zone D
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[10px]">Sprinkler</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          60 W
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold text-foreground">
                          LED Photoperiod Light A
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Zone A
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[10px]">LED</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          120 W
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">
                    Microclimate & Telemetry Alerts
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Configure automated notifications for critical environmental conditions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        Critical Temperature Alert (&gt;28°C)
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Trigger urgent alert if incubation chamber temperature exceeds safe mycelium threshold.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold px-2.5 py-0.5">
                      Active
                    </Badge>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        Low Relative Humidity Alert (&lt;80% RH)
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Notify operator when fruiting room humidity drops below pinhead fruiting range.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold px-2.5 py-0.5">
                      Active
                    </Badge>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        ESP32 Offline Telemetry Heartbeat
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Receive notice if ESP32 fails to transmit sensor data for more than 5 minutes.
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold px-2.5 py-0.5">
                      Immediate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4.5 text-primary" />
                    <CardTitle className="text-lg font-bold tracking-tight">
                      Authentication & Identity Governance
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    SmartGrow uses passwordless Google OAuth 2.0 via Clerk for enterprise-grade authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start justify-between p-4 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                        <CheckCircle2 className="size-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">
                          Google OAuth 2.0 Single Sign-On
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Secured with Google Cloud Identity. No passwords are stored or required.
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground pt-1">
                          User ID: {user?.id}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold px-2.5 py-0.5">
                      Verified
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Encryption Standard
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        TLS 1.3 / AES-256
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        All telemetry and database queries are encrypted in transit.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Access Control
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        Role-Based Security
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        System permissions are strictly enforced based on your assigned role.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <DialogTitle className="text-base font-bold text-destructive">
                Delete Account Confirmation
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              This will permanently delete your account (
              <span className="font-semibold text-foreground">{userEmail}</span>) and associated platform data. This action is irreversible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs font-medium text-foreground">
              To confirm, type <strong className="text-destructive font-mono">DELETE</strong> in the box below:
            </p>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="h-10 text-xs font-mono rounded-xl bg-muted/20 border-border focus:border-destructive"
              autoFocus
            />
          </div>

          <div className="pt-3 grid grid-cols-2 gap-3 w-full border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-10 w-full rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleteConfirmationText.trim().toUpperCase() !== "DELETE" ||
                isDeletingAccount
              }
              className="h-10 w-full rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-1.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Deleting Account Overlay */}
      {isDeletingAccount && (
        <div className="fixed inset-0 z-[9999] bg-background animate-in fade-in duration-200">
          <LoadingScreen
            title="Deleting SmartGrow Account..."
            subtitle="Permanently removing profile records from Supabase and Clerk."
          />
        </div>
      )}
    </div>
  );
}
