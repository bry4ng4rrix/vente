'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserById, saveUser } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: ''
  });
  const [tempUserData, setTempUserData] = useState(userData);

  useEffect(() => {
    if (user) {
      const userInfo = getUserById(user.id);
      if (userInfo) {
        const data = {
          name: userInfo.name || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          address: userInfo.address || '',
          bio: userInfo.bio || '',
          avatar: userInfo.avatar || ''
        };
        setUserData(data);
        setTempUserData(data);
      }
    }
  }, [user]);

  useEffect(() => {
    generateQRCode();
  }, [userData]);

  const generateQRCode = async () => {
    if (user && userData.name) {
      try {
        const profileData = {
          id: user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: user.role,
          createdAt: user.createdAt
        };
        
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(profileData), {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    }
  };

  const handleEdit = () => {
    setTempUserData(userData);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, ...tempUserData };
      saveUser(updatedUser);
      setUserData(tempUserData);
      setIsEditing(false);
      generateQRCode();
    }
  };

  const handleCancel = () => {
    setTempUserData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `profile-${userData.name.replace(/\s+/g, '-')}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQRCode(!showQRCode)}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </Button>
          {!isEditing ? (
            <Button onClick={handleEdit} className="gap-2">
              <Edit2 className="w-4 h-4" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Enregistrer
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>

      {showQRCode && (
        <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code de Profil
            </CardTitle>
            <CardDescription>
              Scannez ce QR code pour accéder rapidement aux informations de ce profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {qrCodeUrl && (
                <div className="relative">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code du profil" 
                    className="rounded-lg shadow-lg border-4 border-white"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button onClick={downloadQRCode} className="gap-2">
                <Download className="w-4 h-4" />
                Télécharger le QR Code
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Ce QR code contient vos informations de profil essentielles</p>
              <p>Partagez-le pour un accès rapide à votre profil</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-center">Photo de profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl">
                      {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="avatar">URL de la photo</Label>
                    <Input
                      id="avatar"
                      value={tempUserData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}
                <div className="text-center">
                  <Badge variant={user.role === 'client' ? 'default' : 'secondary'}>
                    {user.role === 'client' ? 'Client' : user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  {isEditing ? 'Modifiez vos informations' : 'Vos informations personnelles'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={isEditing ? tempUserData.name : userData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? tempUserData.email : userData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={isEditing ? tempUserData.phone : userData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={isEditing ? tempUserData.address : userData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <textarea
                    id="bio"
                    value={isEditing ? tempUserData.bio : userData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    className="w-full min-h-25 px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Membre depuis: {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>ID: {user.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Mot de passe</h4>
                    <p className="text-sm text-muted-foreground">Dernière modification: Il y a 30 jours</p>
                  </div>
                  <Button variant="outline">Modifier</Button>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Authentification à deux facteurs</h4>
                    <p className="text-sm text-muted-foreground">Non configurée</p>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sessions actives</h4>
                    <p className="text-sm text-muted-foreground">2 sessions actives</p>
                  </div>
                  <Button variant="outline">Voir tout</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos dernières activités sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune activité récente à afficher</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
