import re

with open('src/App.tsx', 'r') as f:
    app = f.read()

# Replace inline wrapper function usages.
app = re.sub(r'\{renderDecoupledLiveInventorySection\(\)\}', r'<LiveInventoryCard isCritical={isCritical} totalTableStock={totalTableStock} totalVanStock={totalVanStock} onOpenTransferModal={() => setIsTransferModalOpen(true)} />', app)

app = re.sub(r'\{renderDecoupledLiveTeamActivitySection\(\)\}', r'<LiveTeamActivityCard teamMembers={teamMembers} teamActivities={teamActivities} setIsLiveTeamActivityOpen={(open) => { if (open) { setActiveTab("settings"); setSettingsExpandedSection("team"); } }} triggerNotification={triggerNotification} />', app)

app = re.sub(r'\{renderCashDrawerLedgerSection\(\)\}', r'<CashDrawerLedgerCard summary={getCashDrawerSummary()} cashTransactions={cashTransactions} setCashTransactions={setCashTransactions} inlineCashDrawerActiveFilter={inlineCashDrawerActiveFilter} setInlineCashDrawerActiveFilter={setInlineCashDrawerActiveFilter} inlineCashDrawerAddingType={inlineCashDrawerAddingType} setInlineCashDrawerAddingType={setInlineCashDrawerAddingType} inlineCashDrawerAmount={inlineCashDrawerAmount} setInlineCashDrawerAmount={setInlineCashDrawerAmount} inlineCashDrawerDescription={inlineCashDrawerDescription} setInlineCashDrawerDescription={setInlineCashDrawerDescription} triggerNotification={triggerNotification} />', app)

app = re.sub(r'\{renderRecentSalesFeed\(\)\}', r'<RecentSalesFeed sales={sales} inventory={inventory} setSales={setSales} addLog={addLog} setSelectedSaleReceipt={setSelectedSaleReceipt} setIsGlobalHoverPaused={setIsGlobalHoverPaused} />', app)

# Now, optionally remove the actual functions
app = re.sub(r'  const renderDecoupledLiveInventorySection = \(\) => \{.*?\};\n', '', app, flags=re.DOTALL)
app = re.sub(r'  const renderDecoupledLiveTeamActivitySection = \(\) => \{.*?\};\n', '', app, flags=re.DOTALL)
app = re.sub(r'  const renderCashDrawerLedgerSection = \(\) => \{.*?\};\n', '', app, flags=re.DOTALL)
app = re.sub(r'  const renderRecentSalesFeed = \(\) => \{.*?\};\n', '', app, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(app)

