const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

const endStart = content.indexOf('                </>\n              )}');
if (endStart !== -1) {
  const endEnd = content.indexOf('          )}', endStart) + '          )}'.length;
  if (endEnd > endStart) {
    const oldStr = content.substring(endStart, endEnd);
    const newStr = `              </div>
              
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
    content = content.replace(oldStr, newStr);
    fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
    console.log('Fixed end block');
  }
}
