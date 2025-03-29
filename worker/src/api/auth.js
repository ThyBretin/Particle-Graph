export async function verifyToken(token, env) {
    const valid = await env.KV.get(`token:${token}`);
    return valid === "valid";
  }
  
  export async function registerToken(token, env) {
    await env.KV.put(`token:${token}`, "valid", { expirationTtl: 3600 }); // 1 hour
    return true;
  }