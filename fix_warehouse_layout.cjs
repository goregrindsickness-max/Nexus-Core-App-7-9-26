const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

const oldStart = `          {activeTab === 'warehouse' && (
            <div className="space-y-6 w-full animate-fade-in text-zinc-300 pb-20">`;

const newStart = `          {activeTab === 'warehouse' && (
            <div className={\`w-full animate-fade-in text-zinc-300 \${editingWarehouseItem ? 'flex flex-col xl:flex-row gap-4 h-[calc(100vh-120px)] overflow-hidden' : 'space-y-6 pb-20'}\`}>
              <div className={\`\${editingWarehouseItem ? 'w-full xl:w-1/2 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar space-y-6' : 'w-full space-y-6'}\`}>`;

if (content.includes(oldStart)) {
  content = content.replace(oldStart, newStart);
} else {
  console.log("Could not find oldStart");
}

const oldMid = `              {editingWarehouseItem ? (
                <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden relative min-h-[600px]">
                  <AddItemView 
                    initialItem={editingWarehouseItem.id ? editingWarehouseItem : undefined}
                    onBack={() => setEditingWarehouseItem(null)}
                    onSave={async (item) => {
                      showLocalToast(editingWarehouseItem.id ? 'Item Updated' : 'Item Added');
                      setEditingWarehouseItem(null);
                      return true;
                    }}
                    onDelete={(id) => {
                      showLocalToast('Item Deleted');
                      setEditingWarehouseItem(null);
                    }}
                    triggerNotification={showLocalToast}
                  />
                </div>
              ) : (
                <>`;

const newMid = ``; // Remove the conditional rendering

if (content.includes(oldMid)) {
  content = content.replace(oldMid, newMid);
} else {
  console.log("Could not find oldMid");
}

const oldEnd = `                </>
              )}
            </div>
          )}`;

const newEnd = `              </div>
              
              {/* Split Form View */}
              {editingWarehouseItem && (
                <div className="w-full xl:w-1/2 h-full bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden relative flex flex-col">
                  <AddItemView 
                    initialItem={editingWarehouseItem.id ? editingWarehouseItem : undefined}
                    onBack={() => setEditingWarehouseItem(null)}
                    onSave={async (item) => {
                      showLocalToast(editingWarehouseItem.id ? 'Item Updated' : 'Item Added');
                      setEditingWarehouseItem(null);
                      return true;
                    }}
                    onDelete={(id) => {
                      showLocalToast('Item Deleted');
                      setEditingWarehouseItem(null);
                    }}
                    triggerNotification={showLocalToast}
                  />
                </div>
              )}
            </div>
          )}`;

if (content.includes(oldEnd)) {
  content = content.replace(oldEnd, newEnd);
} else {
  console.log("Could not find oldEnd");
}

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
console.log('Fixed warehouse layout');
