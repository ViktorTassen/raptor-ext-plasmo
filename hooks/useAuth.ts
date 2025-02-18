import { useState } from "react"

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const response = await chrome.runtime.sendMessage({ action: 'signIn' });

        if (response.error) {
          console.error('Sign in error:', response.error);
        }
    } catch (e) {
      console.error("Could not log in. ", e)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleGoogleSignIn
  }
}
