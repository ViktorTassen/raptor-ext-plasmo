import { type FC } from "react"
import { useAuth } from "~hooks/useAuth"

const SignInPopup: FC = () => {
  const { isLoading, handleGoogleSignIn } = useAuth()

  return (
    <div className="w-[90%] max-w-md bg-white rounded-lg shadow-elevation-3 p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Google Blue Shape - Large squircle */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-[40px] rotate-12 bg-[#4285F4] opacity-[0.15]" />
        
        {/* Google Red Shape - Triangle */}
        <div className="absolute -left-8 bottom-8">
          <div className="w-32 h-32 transform rotate-45 bg-[#EA4335] opacity-[0.12]" />
        </div>
        
        {/* Google Yellow Shape - Circle */}
        <div className="absolute right-12 bottom-[-20px] w-28 h-28 rounded-full bg-[#FBBC05] opacity-[0.15]" />
        
        {/* Google Green Shape - Rectangle */}
        <div className="absolute left-1/3 top-4 w-16 h-24 rounded-xl bg-[#34A853] opacity-[0.12] rotate-12" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-xl font-display font-bold italic text-center text-gray-800 mb-8">
        RAPTOR EXPLORER
        </h1>

        <div className="text-sm text-gray-600 mb-8 text-center">
          <p>Sign in to start</p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 
                   text-gray-700 py-2.5 px-4 rounded-full hover:bg-gray-50
                   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200">
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SignInPopup