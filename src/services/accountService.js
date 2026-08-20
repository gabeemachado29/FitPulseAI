/**
 * FitPulseAI — Account Management Service (Production-Ready & LGPD Compliant)
 *
 * Handles account deletion, data export (LGPD), password reset,
 * secure password updates, Google Auth pipeline, and input validations.
 */

import {
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, db, googleProvider } from '../config/firebase';

/**
 * Universal Google Sign In Helper for Mobile (Capacitor) & Web.
 * Features auto-fallback pipeline: Native Plugin -> Web Popup -> Web Redirect.
 */
export async function performGoogleSignIn() {
  if (Capacitor.isNativePlatform()) {
    try {
      try {
        await GoogleAuth.initialize({
          clientId: '293907355720-kp5enb8cdva15e05bcnv9cvahntj6pem.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } catch (initErr) {
        console.warn('GoogleAuth initialize warning:', initErr);
      }

      const googleUser = await GoogleAuth.signIn();
      const idToken =
        googleUser?.authentication?.idToken ||
        googleUser?.idToken;

      if (!idToken) {
        throw new Error('Nenhum token retornado pelo Google Sign-In.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);
      return userCred.user;
    } catch (nativeErr) {
      console.error('Native GoogleAuth error:', nativeErr);
      const errCode = nativeErr?.code || nativeErr?.message || String(nativeErr);
      if (errCode === '12500' || errCode.includes('cancel') || errCode.includes('popup-closed')) {
        throw new Error('auth/popup-closed-by-user');
      }
      if (errCode === '10' || errCode.includes('DEVELOPER_ERROR')) {
        throw new Error('Erro de configuração do Google Play Services (SHA-1 fingerprint necessário no Firebase Console).');
      }
      throw nativeErr;
    }
  } else {
    // Standard Web Flow (PC / Browser)
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      return userCred.user;
    } catch (popupErr) {
      if (popupErr.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw popupErr;
    }
  }
}

/**
 * Send a password reset email.
 */
export async function sendPasswordReset(email) {
  if (!email || !email.trim()) {
    throw new Error('Preencha o campo de e-mail primeiro.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new Error('Formato de e-mail inválido.');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return 'Link de redefinição de senha enviado! Verifique sua caixa de entrada e spam.';
  } catch (err) {
    throw new Error(getFirebaseAuthErrorMessage(err.code || err.message));
  }
}

/**
 * Safely updates user password, handling re-authentication if required.
 *
 * @param {import('firebase/auth').User} user
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function updateUserPasswordSafe(user, currentPassword, newPassword) {
  if (!user) throw new Error('Usuário não autenticado.');
  if (!newPassword || newPassword.length < 8) {
    throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  }

  // Check if user has password provider
  const isPasswordProvider = user.providerData?.some(
    (p) => p.providerId === 'password'
  );

  if (isPasswordProvider && currentPassword) {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    } catch (reauthErr) {
      throw new Error('Senha atual incorreta. Verifique e tente novamente.');
    }
  }

  try {
    await updatePassword(user, newPassword);
    return 'Senha alterada com sucesso!';
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error('Por segurança, faça login novamente antes de alterar a senha.');
    }
    throw new Error(getFirebaseAuthErrorMessage(err.code || err.message));
  }
}

/**
 * LGPD Data Portability: Exports all user data into a JSON file and triggers download.
 *
 * @param {string} uid
 * @param {string} [userEmail]
 */
export async function exportAllUserData(uid, userEmail = '') {
  if (!uid) throw new Error('User ID é obrigatório para exportação.');

  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      service: 'FitPulseAI',
      version: '1.0',
      compliance: 'LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)',
      user: {
        uid,
        email: userEmail,
      },
    },
    profile: null,
    nutritionLogs: [],
    waterLogs: [],
    workouts: [],
    workoutSessions: [],
    burnedLogs: [],
    achievements: [],
  };

  try {
    // 1. Profile Doc
    const profileDocRef = doc(db, 'users', uid);
    const profileSnap = await getDoc(profileDocRef);
    if (profileSnap.exists()) {
      exportData.profile = profileSnap.data();
    }

    // 2. Subcollections
    const collectionsToFetch = [
      'nutritionLogs',
      'waterLogs',
      'workouts',
      'workoutSessions',
      'burnedLogs',
      'achievements',
    ];

    for (const colName of collectionsToFetch) {
      try {
        const colRef = collection(db, 'users', uid, colName);
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          exportData[colName] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
        }
      } catch (colErr) {
        console.warn(`Aviso ao exportar ${colName}:`, colErr);
      }
    }

    // 3. Trigger Browser File Download
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `fitpulse_meus_dados_lgpd_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    return exportData;
  } catch (err) {
    console.error('Erro na exportação de dados LGPD:', err);
    throw new Error('Falha ao gerar arquivo de exportação de dados.');
  }
}

/**
 * Delete all user data from Firestore subcollections.
 * LGPD compliant cascade deletion.
 */
export async function deleteUserData(uid) {
  if (!uid) throw new Error('User ID necessário');

  const subcollections = [
    'nutritionLogs',
    'workouts',
    'workoutSessions',
    'waterLogs',
    'burnedLogs',
    'achievements',
  ];

  for (const subName of subcollections) {
    try {
      const colRef = collection(db, 'users', uid, subName);
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn(`Falha ao deletar subcoleção ${subName}:`, err);
    }
  }

  try {
    const integrationsRef = collection(db, 'users', uid, 'integrations');
    const intSnap = await getDocs(integrationsRef);
    if (!intSnap.empty) {
      const batch = writeBatch(db);
      intSnap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Falha ao deletar integrações:', err);
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
  } catch (err) {
    console.warn('Falha ao deletar documento de perfil:', err);
  }
}

/**
 * Delete the user's Firebase Auth account.
 */
export async function deleteUserAccount(user) {
  if (!user) throw new Error('Usuário não autenticado');

  try {
    await deleteUserData(user.uid);
    await deleteUser(user);
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error('REQUIRES_REAUTH');
    }
    throw new Error(getFirebaseAuthErrorMessage(err.code || err.message));
  }
}

/**
 * Re-authenticate user with email/password.
 */
export async function reauthenticateUser(user, password) {
  if (!user || !user.email) throw new Error('Usuário não encontrado');

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (err) {
    throw new Error(getFirebaseAuthErrorMessage(err.code || err.message));
  }
}

/**
 * Brazilian Phone Mask Utility: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export function formatPhoneBR(value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Validate email format.
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate password strength.
 */
export function validatePasswordStrength(password) {
  const feedback = [];
  let score = 0;

  if (!password) {
    return { valid: false, score: 0, feedback: ['Digite uma senha'] };
  }

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Mínimo 8 caracteres');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Pelo menos 1 letra maiúscula');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Pelo menos 1 letra minúscula');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Pelo menos 1 número');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  return {
    valid: score >= 4,
    score,
    feedback,
  };
}

/**
 * Translate Firebase & Google Auth error codes to user-friendly PT-BR messages.
 */
export function getFirebaseAuthErrorMessage(code, customMessage) {
  const codeStr = String(code || '');
  const messages = {
    'auth/invalid-credential': 'E-mail ou credencial inválida.',
    'auth/invalid-email': 'Formato de e-mail inválido.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 8 caracteres.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/requires-recent-login': 'Por segurança, faça login novamente antes desta ação.',
    'auth/popup-closed-by-user': 'Login cancelado pelo usuário.',
    '12500': 'Login cancelado pelo usuário.',
    '10': 'Erro de configuração do Google Play Services.',
    'DEVELOPER_ERROR': 'Erro de configuração do Google Sign-In.',
    'auth/network-request-failed': 'Falha de rede. Verifique sua conexão.',
    'auth/internal-error': 'Erro interno. Tente novamente.',
    'auth/popup-blocked': 'Pop-up bloqueado. Permita pop-ups e tente novamente.',
    'auth/account-exists-with-different-credential':
      'Já existe uma conta com este e-mail usando outro método de login.',
    'auth/credential-already-in-use': 'Esta credencial já está associada a outra conta.',
    'auth/missing-password': 'Informe sua senha.',
  };

  return (
    messages[codeStr] ||
    customMessage ||
    (codeStr && codeStr !== 'undefined'
      ? `Erro no login (${codeStr}). Tente novamente.`
      : 'Ocorreu um erro no login com Google. Tente novamente.')
  );
}
