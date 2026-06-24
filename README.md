# SafeSpace - Women-Only Creator Platform

Instagram完全パクのレズビアン・女性向けクリエイタープラットフォーム

## アクセスリンク

### ユーザー用
- **本番**: https://safespace-chi.vercel.app
- テストアカウント: test@safespace.jp / Password123

### 運営者用（大成さん）
- **管理画面**: https://safespace-chi.vercel.app/admin
- **Email**: admin@safespace.jp

## 機能

- Instagram完全パク UI/UX
- 女性限定（性別認証）
- 本人確認（パスポート・免許・国民ID）
- チップ機能（Stripe統合）
- Creator マネタイズ
- 自動手数料計算・出金管理
- DM・Stories・Explore
- プロフィール・Settings
- 多言語対応（日本語・英語）

## 技術スタック

- Next.js 16.2.9 (Turbopack)
- Firebase Auth + Realtime Database
- Stripe
- TypeScript
- インラインスタイル（Tailwind不使用）

## セットアップ

```bash
cd safespace
npm install
npm run build
npm run dev
```

## ビジネスモデル
cd ~/safespace

# admin ページを作成
cat > app/admin/page.tsx << 'EOF'
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Theme, Colors } from '@/app/types';
import { getColors } from '@/app/utils/theme';
import AdminDashboard from '@/app/components/AdminDashboard';

const ADMIN_EMAIL = 'admin@safespace.jp';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('dark');

  const c = getColors(theme);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
        setIsAdmin(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: c.bg, 
        color: c.text, 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ 
        backgroundColor: c.bg, 
        color: c.text, 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Access Denied</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Admin only</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh' }}>
      <AdminDashboard c={c} transactions={[]} users={[]} />
    </div>
  );
}
