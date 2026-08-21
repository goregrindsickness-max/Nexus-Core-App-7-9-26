with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

target = '<form onSubmit={handleSignup} className="w-full flex flex-col items-stretch space-y-5" autoComplete="off">'
replacement = '''<form onSubmit={handleSignup} className="w-full flex flex-col items-stretch space-y-5" autoComplete="off">
                {registrationPage === 1 ? (
                  <>
                    <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-4">
                      <button
                        type="button"
                        onClick={() => setAccountTypeToggle('Fan Only Supporter')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded transition-all ${accountTypeToggle === 'Fan Only Supporter' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Fan Only Supporter
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountTypeToggle('Industry Pro')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded transition-all ${accountTypeToggle === 'Industry Pro' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Industry Pro
                      </button>
                    </div>
'''
if target in content:
    content = content.replace(target, replacement)
    print("Injected toggle and Page 1 start!")
else:
    print("Could not find the target form start!")

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
