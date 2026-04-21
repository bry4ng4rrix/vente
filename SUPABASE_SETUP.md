# Configuration Supabase

## Installation des packages ✅

Les packages Supabase sont déjà installés :
- `@supabase/supabase-js`
- `@supabase/ssr`

## Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre_clé_publique
```

**Note :** Un fichier `.env.local.example` a été créé comme modèle. Copiez-le et renommez-le en `.env.local` avec vos vraies clés.

## Fichiers créés

### 1. Utils Supabase
- `utils/supabase/server.ts` - Client pour les composants serveur
- `utils/supabase/client.ts` - Client pour les composants client
- `utils/supabase/middleware.ts` - Client pour le middleware

### 2. Middleware
- `middleware.ts` - Middleware Next.js pour la gestion des sessions Supabase

## Utilisation

### Dans un composant serveur

```tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: users } = await supabase.from('users').select()

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### Dans un composant client

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const supabase = createClient()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select()
      setUsers(data)
    }
    fetchUsers()
  }, [supabase])

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Étapes suivantes

1. **Créer le projet Supabase**
   - Allez sur https://supabase.com
   - Créez un nouveau projet
   - Notez l'URL et la clé publique

2. **Configurer les variables d'environnement**
   - Copiez `.env.local.example` vers `.env.local`
   - Remplacez les valeurs par vos clés Supabase

3. **Exécuter le schéma de base de données**
   - Allez dans le dashboard Supabase → SQL Editor
   - Exécutez les requêtes SQL du fichier `db.md`

4. **Tester l'intégration**
   - Redémarrez le serveur de développement
   - Testez les fonctionnalités d'authentification

## Migration depuis localStorage

L'application utilise actuellement `localStorage` pour le stockage. Pour migrer vers Supabase :

1. **Authentification** : Remplacer `lib/auth-context.ts` par l'auth Supabase
2. **Stockage** : Remplacer les fonctions `lib/storage.ts` par des appels Supabase
3. **Types** : Les types dans `lib/types.ts` sont compatibles avec Supabase

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase avec Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Authentification Supabase](https://supabase.com/docs/guides/auth)
