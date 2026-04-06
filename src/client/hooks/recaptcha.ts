declare const grecaptcha: any

const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim()

export function isRecaptchaEnabled() {
  return recaptchaSiteKey.length > 0
}

export async function getRecaptchaToken(action: string): Promise<string> {
  if (!isRecaptchaEnabled()) {
    return ''
  }

  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === "undefined") {
      reject(new Error("reCAPTCHA not loaded"))
      return
    }

    grecaptcha.enterprise.ready(async () => {
      try {
        const token = await grecaptcha.enterprise.execute(
          recaptchaSiteKey,
          { action }
        )
        resolve(token)
      } catch (error) {
        reject(error)
      }
    })
  })
}