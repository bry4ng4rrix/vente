'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllUsers, saveUser, deleteUser } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/lib/types';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState(getAllUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    storeName: '',
  });

  if (!user) return null;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vendorUsers = filteredUsers.filter(u => u.role === 'vendor');
  const clientUsers = filteredUsers.filter(u => u.role === 'client');

  const handleEdit = (selectedUser: User) => {
    setEditingUser(selectedUser);
    setFormData({
      name: selectedUser.name,
      email: selectedUser.email,
      storeName: selectedUser.storeName || '',
    });
  };

  const handleSave = () => {
    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        storeName: editingUser.role === 'vendor' ? formData.storeName : undefined,
      };
      saveUser(updatedUser);
      setUsers(getAllUsers());
      setEditingUser(null);
      alert('Utilisateur modifié avec succès');
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(userId);
      setUsers(getAllUsers());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground mt-2">
          Gérez tous les utilisateurs de la plateforme
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.filter(u => u.role === 'vendor').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.filter(u => u.role === 'client').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Edit form */}
      {editingUser && (
        <Card>
          <CardHeader>
            <CardTitle>Modifier {editingUser.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {editingUser.role === 'vendor' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom du magasin</label>
                <Input
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave}>Enregistrer</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users by role */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendeurs ({vendorUsers.length})</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clientUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(selectedUser => (
                <Card key={selectedUser.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                            {selectedUser.role}
                          </span>
                          {selectedUser.role === 'vendor' && selectedUser.storeName && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {selectedUser.storeName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(selectedUser)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(selectedUser.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          {vendorUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">Aucun vendeur trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vendorUsers.map(selectedUser => (
                <Card key={selectedUser.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                        <p className="text-sm font-medium mt-1">{selectedUser.storeName}</p>
                        {selectedUser.storeDescription && (
                          <p className="text-sm text-muted-foreground">{selectedUser.storeDescription}</p>
                        )}
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Ventes:</span>
                            <span className="ml-1 font-semibold">{selectedUser.totalSales || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Revenu:</span>
                            <span className="ml-1 font-semibold">{(selectedUser.totalRevenue || 0).toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(selectedUser)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(selectedUser.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {clientUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">Aucun client trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {clientUsers.map(selectedUser => (
                <Card key={selectedUser.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(selectedUser)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(selectedUser.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
