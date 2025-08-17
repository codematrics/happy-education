"use client";

import CustomImage from "@/components/common/CustomImage";
import LoadingError from "@/components/common/LoadingError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSendProfileOtp, useVerifyProfileOtp } from "@/hooks/useProfileVerification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Mail, Phone, Shield, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  profileImage?: {
    url: string;
    publicId: string;
  };
  isVerified: boolean;
  createdAt: string;
}

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const {
    data: profileResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await fetch("/api/v1/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
  });

  const profile = profileResponse?.data;

  const sendOtpMutation = useSendProfileOtp();
  const verifyOtpMutation = useVerifyProfileOtp();

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/v1/user/profile", {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.status) {
        toast.success(data.message);
        setIsEditing(false);
        setProfileData({});
        setProfileImageFile(null);
        setImagePreview(null);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setProfileData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      mobileNumber: profile?.mobileNumber || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({});
    setProfileImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    
    if (profileData.firstName) {
      formData.append("firstName", profileData.firstName);
    }
    if (profileData.lastName) {
      formData.append("lastName", profileData.lastName);
    }
    if (profileData.mobileNumber) {
      formData.append("mobileNumber", profileData.mobileNumber);
    }
    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    updateProfileMutation.mutate(formData);
  };

  const handleSendOtp = () => {
    sendOtpMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.status) {
          toast.success(data.message);
          setShowOtpInput(true);
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send OTP");
      },
    });
  };

  const handleVerifyOtp = () => {
    if (!otpCode.trim()) {
      toast.error("Please enter the OTP code");
      return;
    }

    verifyOtpMutation.mutate(
      { otp: otpCode },
      {
        onSuccess: (data) => {
          if (data.status) {
            toast.success(data.message);
            setShowOtpInput(false);
            setOtpCode("");
          } else {
            toast.error(data.message);
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to verify OTP");
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <LoadingError
        isLoading={isLoading}
        error={error?.message}
        errorTitle="Failed to load profile"
        onRetry={refetch}
        skeleton={
          <Card>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your personal details
                </p>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden">
                    {imagePreview || profile?.profileImage?.url ? (
                      <CustomImage
                        src={imagePreview || profile?.profileImage?.url || ""}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Member since{" "}
                    {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={
                      isEditing
                        ? profileData.firstName || ""
                        : profile?.firstName || ""
                    }
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={
                      isEditing
                        ? profileData.lastName || ""
                        : profile?.lastName || ""
                    }
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="pr-10"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <div className="relative">
                    <Input
                      id="mobileNumber"
                      type="tel"
                      value={
                        isEditing
                          ? profileData.mobileNumber || ""
                          : profile?.mobileNumber || ""
                      }
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          mobileNumber: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="pr-10"
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {profile?.isVerified ? (
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <Shield className="w-5 h-5 text-yellow-600" />
                )}
                Account Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Verification Status</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.isVerified 
                      ? "Your account is verified and secure"
                      : "Verify your account to unlock all features"
                    }
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile?.isVerified ? "Verified" : "Pending"}
                </div>
              </div>

              {/* OTP Verification Section */}
              {!profile?.isVerified && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Verify Your Account</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        We&apos;ll send a verification code to <strong>{profile?.email}</strong>
                      </p>
                    </div>

                    {!showOtpInput ? (
                      <Button
                        onClick={handleSendOtp}
                        disabled={sendOtpMutation.isPending}
                        className="w-full"
                      >
                        {sendOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="otpCode">Enter Verification Code</Label>
                          <Input
                            id="otpCode"
                            type="text"
                            placeholder="Enter 4-digit code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength={4}
                            className="text-center text-lg tracking-widest"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Code expires in 5 minutes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleVerifyOtp}
                            disabled={verifyOtpMutation.isPending || !otpCode.trim()}
                            className="flex-1"
                          >
                            {verifyOtpMutation.isPending ? "Verifying..." : "Verify Account"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleSendOtp}
                            disabled={sendOtpMutation.isPending}
                            className="flex-1"
                          >
                            {sendOtpMutation.isPending ? "Sending..." : "Resend Code"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </LoadingError>
    </div>
  );
};

export default ProfilePage;