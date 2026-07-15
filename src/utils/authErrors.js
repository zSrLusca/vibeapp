export function getAuthErrorMessage(code, fallbackMessage) {
  const messages = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "Login com Google cancelado.",
    "auth/popup-blocked": "Popup bloqueado. Permita popups para este site.",
    "auth/cancelled-popup-request": "Login com Google cancelado.",
    "auth/unauthorized-domain":
      "Domínio não autorizado. Adicione a URL da Vercel no Firebase e no Google Cloud Console.",
    "auth/argument-error":
      "Erro de configuração do login. Verifique Google Sign-In no Firebase e o domínio da Vercel.",
    "auth/account-exists-with-different-credential":
      "Este e-mail já está vinculado a outro método de login.",
    "auth/operation-not-allowed":
      "Cadastro desativado. Ative E-mail/Senha e Google no Firebase Console.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
    "permission-denied":
      "Permissão negada no Firestore. Configure as regras de segurança.",
  };

  return messages[code] || fallbackMessage || "Ocorreu um erro. Tente novamente.";
}
