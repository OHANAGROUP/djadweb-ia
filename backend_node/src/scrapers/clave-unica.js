/**
 * Clave Unica Integration - Chilean Government SSO
 *
 * Placeholder para futura integracion OAuth 2.0 con Clave Unica.
 * Cuando esté lista, reemplazará la autenticacion por password en SII.
 *
 * Documentacion: https://claveunica.gob.cl/desarrolladores/
 *
 * URL de autorizacion:
 *   https://accounts.claveunica.gob.cl/openid/authorize?
 *     response_type=code&
 *     client_id=CLIENT_ID&
 *     redirect_uri=REDIRECT_URI&
 *     scope=openid+email+run+name&
 *     state=STATE
 *
 * Token endpoint:
 *   POST https://accounts.claveunica.gob.cl/openid/token
 *   Body: grant_type=authorization_code&code=CODE&redirect_uri=...
 *
 * Userinfo endpoint:
 *   GET https://accounts.claveunica.gob.cl/openid/userinfo
 *   Header: Authorization: Bearer ACCESS_TOKEN
 */

// Placeholder - no implementado aun
module.exports = {};
