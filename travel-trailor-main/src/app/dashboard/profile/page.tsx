
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, updateUserProfile, changeUserPassword, signOut } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name === user?.displayName) {
        setIsEditing(false);
        return;
    };
    
    setIsUpdatingProfile(true);
    try {
      await updateUserProfile(name);
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const handleCancelEdit = () => {
    if (user?.displayName) {
      setName(user.displayName);
    }
    setIsEditing(false);
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill in both password fields.',
        });
        return;
    }

    setIsChangingPassword(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      toast({
        title: 'Success',
        description: 'Your password has been changed. You will be logged out shortly.',
      });
      setTimeout(() => signOut(), 3000);
    } catch (error: any) {
        console.error(error);
        let description = 'Could not change your password. Please try again.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'The current password you entered is incorrect.';
        }
        toast({
            variant: 'destructive',
            title: 'Password Change Failed',
            description,
        });
    } finally {
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
    }
  };

  if (loading || !user) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </div>
            <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
            </div>
            {!isEditing && (
                 <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
        </CardHeader>
        <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email ?? ''} disabled />
                </div>
                {isEditing && (
                    <div className="flex gap-2">
                         <Button type="submit" disabled={isUpdatingProfile || name === user.displayName}>
                            {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                    </div>
                )}
            </form>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            For security, you will be logged out after changing your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                        <Input 
                            id="current-password" 
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowCurrentPassword(prev => !prev)}
                        >
                           {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           <span className="sr-only">Toggle current password visibility</span>
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                        <Input 
                            id="new-password" 
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10"
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowNewPassword(prev => !prev)}
                        >
                           {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           <span className="sr-only">Toggle new password visibility</span>
                        </Button>
                    </div>
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
