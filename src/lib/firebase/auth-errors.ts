export function studioSignInError(error:unknown):string{
 const code=error&&typeof error==='object'&&'code' in error?String(error.code):'';
 if(code==='auth/popup-closed-by-user'||code==='auth/cancelled-popup-request')return '';
 if(code==='auth/popup-blocked')return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.';
 return 'No pudimos iniciar sesión con Google. Inténtalo de nuevo.';
}
