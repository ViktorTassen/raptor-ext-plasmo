import React from "react"
import "~style.css"
import welcomeScreenImg1 from "data-base64:~assets/welcome-screen-1.png"
import welcomeScreenImg2 from "data-base64:~assets/welcome-screen-2.png"

function Welcome() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="py-12">
          <div className="max-w-3xl mx-auto">
            {/* Content Container */}
            <div className="bg-white rounded-lg shadow-elevation-1 overflow-hidden">
              {/* Decorative Background */}
              <div className="relative p-8 overflow-hidden">
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

                {/* Welcome Content */}
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                      Welcome to Raptor Explorer! 🎉
                    </h1>
                    <p className="text-lg text-gray-600">
                      Send your first fax in seconds for free
                    </p>
                  </div>

                  <div className="space-y-12">
                    {/* Step 1 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium">1</span>
                        </div>
                        <h2 className="text-xl font-medium text-gray-900">
                          Pin the extension for quick access
                        </h2>
                      </div>
                      <p className="text-gray-600 ml-11">
                        Pin Raptor to your toolbar for quick and easy access.
                      </p>
                      <div className="ml-11">
                        <img
                          src={welcomeScreenImg1}
                          alt="Pin Extension"
                          className="rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium">2</span>
                        </div>
                        <h2 className="text-xl font-medium text-gray-900">
                          Open Turo search page
                        </h2>
                      </div>
                      <p className="text-gray-600 ml-11">
                      Click the Raptor Explorer button. Sign in with Google to start your research.
                      </p>
                      <div className="ml-11">
                        <img
                          src={welcomeScreenImg2}
                          alt="Click icon to open"
                          className="rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Welcome