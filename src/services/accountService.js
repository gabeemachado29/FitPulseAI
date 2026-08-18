/**
 * FitPulseAI — Account Management Service (Production-Ready)
 *
 * Handles account deletion (LGPD compliant), password reset,
 * and re-authentication for sensitive operations.
 */

import {
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Send a password reset email.
 * Returns a user-friendly message in PT-BR.
 */
export async function sendPasswordReset(email) {
  if (!email || !email.trim()) {
    throw new Error('Preencha o campo de e-mail primeiro.');
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Formato de e-mail inválido.');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return 'Link de redefinição de senha enviado! Verifique sua caixa de entrada e spam.';
  } catch (err) {
    throw new Error(getFirebaseAuthErrorMessage(err.code));
  }
}

/**
 * Delete all user data from Firestore subcollections.
 * LGPD compliant — removes all personal data.
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

  // Delete all documents in each subcollection
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

  // Delete integrations subcollection
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

  // Delete the user profile document itself
  try {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
  } catch (err) {
    console.warn('Falha ao deletar documento de perfil:', err);
  }
}

/**
 * Delete the user's Firebase Auth account.
 * May require re-authentication for accounts older than 5 minutes.
 */
export async function deleteUserAccount(user) {
  if (!user) throw new Error('Usuário não autenticado');

  try {
    // Delete all Firestore data first
    await deleteUserData(user.uid);

    // Delete the Firebase Auth account
    await deleteUser(user);
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error('REQUIRES_REAUTH');
    }
    throw new Error(getFirebaseAuthErrorMessage(err.code) || err.message);
  }
}

/**
 * Re-authenticate user with email/password before sensitive operations.
 */
export async function reauthenticateUser(user, password) {
  if (!user || !user.email) throw new Error('Usuário não encontrado');

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (err) {
    throw new Error(getFirebaseAuthErrorMessage(err.code));
  }
}

/**
 * Translate Firebase Auth error codes to user-friendly PT-BR messages.
 */
export function getFirebaseAuthErrorMessage(code) {
  const messages = {
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
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
    'auth/network-request-failed': 'Falha de rede. Verifique sua conexão.',
    'auth/internal-error': 'Erro interno. Tente novamente.',
    'auth/popup-blocked': 'Pop-up bloqueado pelo navegador. Permita pop-ups e tente novamente.',
    'auth/account-exists-with-different-credential':
      'Já existe uma conta com este e-mail usando outro método de login.',
    'auth/credential-already-in-use': 'Esta credencial já está associada a outra conta.',
    'auth/missing-password': 'Informe sua senha.',
  };

  return messages[code] || 'Erro inesperado. Tente novamente.';
}

/**
 * Validate password strength for registration.
 * Returns { valid, score, feedback[] }
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
    valid: score >= 4, // At least 4 of 5 criteria
    score, // 0-5
    feedback,
  };
}
