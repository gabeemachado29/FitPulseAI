/**
 * FitPulseAI — Account Management Service (Production-Ready)
 *
 * Handles account deletion (LGPD compliant), password reset,
 * Google Auth fallback pipeline, and re-authentication.
 */

import {
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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
        GoogleAuth.initialize();
      } catch (initErr) {
        console.warn('GoogleAuth initialize warning:', initErr);
      }

      const googleUser = await GoogleAuth.signIn();
      const idToken =
        googleUser?.authentication?.idToken ||
        googleUser?.idToken ||
        googleUser?.authentication?.accessToken;

      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth, credential);
        return userCred.user;
      }
    } catch (nativeErr) {
      console.warn('Native GoogleAuth failed, falling back to Web Popup:', nativeErr);
    }

    // Fallback to Firebase Web Popup/Redirect on native if plugin fails
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      return userCred.user;
    } catch (popupErr) {
      if (
        popupErr.code === 'auth/popup-blocked' ||
        popupErr.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw popupErr;
    }
  } else {
    // Standard Web Flow
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
  if (!emailRegex.test(email)) {
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
 * Delete all user data from Firestore subcollections.
 * LGPD compliant.
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

/**
 * Validate password strength.
 */
export function validatePasswordStrength(password) {
  const feedback = [];
  let score = 0;

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
