import { useState } from 'preact/hooks'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)

  async function handleAccept() {
    await chrome.storage.local.set({ onboardingComplete: true })
    onComplete()
  }

  const steps = [
    {
      title: 'Welcome to Browsing Tracker',
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>
            Track your browsing habits and gain insights into how you spend your time online.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">What we track:</h3>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Pages you visit (URL and title)</li>
              <li>• Time spent on each page</li>
              <li>• When you bookmark pages</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Your Privacy Matters',
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">Privacy guarantees:</h3>
            <ul className="text-green-700 dark:text-green-300 space-y-1">
              <li>• All data stays on your device</li>
              <li>• No data sent to any servers</li>
              <li>• You control what gets tracked</li>
              <li>• Delete your data anytime</li>
            </ul>
          </div>
          <p>
            You can exclude sensitive sites (like banking or health) in Settings.
          </p>
        </div>
      ),
    },
    {
      title: 'Ready to Start?',
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>
            By clicking "Start Tracking", you agree that:
          </p>
          <ul className="space-y-1">
            <li>• You understand what data is collected</li>
            <li>• You can pause tracking anytime</li>
            <li>• You can delete all data in Settings</li>
          </ul>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Incognito browsing is never tracked.
          </p>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="w-80 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Content */}
      <h1 className="text-lg font-semibold mb-3">{currentStep.title}</h1>
      {currentStep.content}

      {/* Navigation */}
      <div className="flex gap-2 mt-4">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Start Tracking
          </button>
        )}
      </div>

      {/* Skip link */}
      {step === 0 && (
        <button
          onClick={handleAccept}
          className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Skip intro
        </button>
      )}
    </div>
  )
}
