import React from "react";
import "~style.css";
import iconCropped from "data-base64:~assets/turrex-car-nospace.png"


function Welcome() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex flex-col items-center justify-center min-h-screen py-12">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <img
                src={iconCropped}
                alt="Raptor Explorer Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-[#202124] text-4xl font-normal mb-3">
              Welcome to Raptor Explorer
            </h1>
            <p className="text-[#5f6368] text-lg">
              Analyze Turo car listings and make data-driven decisions
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-xs text-lg">
         
            
            <a
              href="https://raptorexplorer.com/instructions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 rounded-lg bg-[#593cfb] text-white hover:bg-[#593CFB]/90 transition-colors"

            >
              Read Instructions
            </a>

            <a
              href="https://turo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 rounded-lg border border-[#593cfb] text-[#593cfb] hover:bg-[#f8f9fa] transition-colors"
            >
              
              Open Turo
            </a>
          </div>

         
        </main>
      </div>
    </div>
  );
}

export default Welcome;