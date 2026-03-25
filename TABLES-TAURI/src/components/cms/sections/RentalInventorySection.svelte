<script>
  import { cmsData, saveInventoryRows } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let editingIndex = null;
  let searchQuery = '';
  let showDeleteConfirm = false;
  let itemToDelete = null;
  
  const defaultItem = {
    itemName: '', sku: '', quantity: '', location: '',
    supplier: '', status: 'In Stock', lastRestocked: '', notes: '', public: false
  };
  
  function handleAdd() {
    saveInventoryRows([{ ...defaultItem }, ...(cmsDataValue?.inventoryRows || [])]);
  }
  
  function handleRemove(index) {
    saveInventoryRows((cmsDataValue?.inventoryRows || []).filter((_, i) => i !== index));
  }
  
  function handleUpdate(index, field, value) {
    const newRows = [...(cmsDataValue?.inventoryRows || [])];
    newRows[index][field] = value;
    saveInventoryRows(newRows);
  }
  
  function requestDelete(index) { itemToDelete = index; showDeleteConfirm = true; }
  function confirmDelete() { showDeleteConfirm = false; if (itemToDelete !== null) { handleRemove(itemToDelete); itemToDelete = null; } }
  
  $: filteredRows = (cmsDataValue?.inventoryRows || []).filter(item => {
    const q = searchQuery.toLowerCase();
    return (item.itemName || '').toLowerCase().includes(q) || (item.sku || '').toLowerCase().includes(q);
  });
</script>

<div class="rental-section">
  {#if editingIndex !== null && cmsDataValue?.inventoryRows}
    <div class="editor-fullscreen">
      <div class="editor-header">
        <button class="btn-back" on:click={() => editingIndex = null}><i class="fas fa-arrow-left"></i> Back</button>
        <h2>Edit: {cmsDataValue.inventoryRows[editingIndex]?.itemName || 'Unnamed'}</h2>
      </div>
      <div class="form-grid">
        <div class="form-group full"><label>Item Name *</label><input type="text" bind:value={cmsDataValue.inventoryRows[editingIndex].itemName} /></div>
        <div class="form-group"><label>SKU</label><input type="text" bind:value={cmsDataValue.inventoryRows[editingIndex].sku} /></div>
        <div class="form-group"><label>Quantity</label><input type="number" bind:value={cmsDataValue.inventoryRows[editingIndex].quantity} /></div>
        <div class="form-group"><label>Location</label><input type="text" bind:value={cmsDataValue.inventoryRows[editingIndex].location} /></div>
        <div class="form-group"><label>Supplier</label><input type="text" bind:value={cmsDataValue.inventoryRows[editingIndex].supplier} /></div>
        <div class="form-group"><label>Status</label><select bind:value={cmsDataValue.inventoryRows[editingIndex].status}><option>In Stock</option><option>Out of Stock</option><option>On Order</option></select></div>
        <div class="form-group"><label>Last Restocked</label><input type="date" bind:value={cmsDataValue.inventoryRows[editingIndex].lastRestocked} /></div>
        <div class="form-group full"><label>Notes</label><textarea bind:value={cmsDataValue.inventoryRows[editingIndex].notes} rows="3"></textarea></div>
        <div class="form-group full"><label><input type="checkbox" bind:checked={cmsDataValue.inventoryRows[editingIndex].public} /> Public</label></div>
      </div>
    </div>
  {:else}
    <div class="section-header">
      <h2><i class="fas fa-boxes"></i> Inventory</h2>
      <div class="actions">
        <input type="text" placeholder="Search..." bind:value={searchQuery} />
        <button class="btn-primary" on:click={handleAdd}><i class="fas fa-plus"></i> Add</button>
      </div>
    </div>
    {#if filteredRows?.length}
      <table class="data-table">
        <thead><tr><th>Name</th><th>SKU</th><th>Qty</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {#each cmsDataValue?.inventoryRows || [] as item, idx}
            {#if filteredRows.includes(item)}
            <tr>
              <td><input type="text" bind:value={item.itemName} /></td>
              <td><input type="text" bind:value={item.sku} /></td>
              <td><input type="number" bind:value={item.quantity} /></td>
              <td><input type="text" bind:value={item.location} /></td>
              <td><select bind:value={item.status}><option>In Stock</option><option>Out of Stock</option><option>On Order</option></select></td>
              <td><button on:click={() => editingIndex = idx}>Edit</button> <button class="btn-danger" on:click={() => requestDelete(idx)}>Delete</button></td>
            </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="empty"><i class="fas fa-boxes"></i><p>No items</p><button class="btn-primary" on:click={handleAdd}>Add First</button></div>
    {/if}
  {/if}
  <ConfirmModal isOpen={showDeleteConfirm} title="Delete?" message="Sure?" confirmText="Delete" cancelText="Cancel" isDestructive onConfirm={confirmDelete} onCancel={() => showDeleteConfirm = false} />
</div>

<style>
  .rental-section { padding: 20px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .section-header h2 { font-size: 24px; display: flex; align-items: center; gap: 10px; }
  .section-header h2 i { color: #2563eb; }
  .actions { display: flex; gap: 10px; }
  .actions input { padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; }
  .editor-fullscreen { position: fixed; inset: 0; background: white; z-index: 1000; padding: 20px; overflow-y: auto; }
  .editor-header { display: flex; gap: 20px; align-items: center; margin-bottom: 20px; }
  .editor-header h2 { margin: 0; flex: 1; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; max-width: 1000px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-group input, .form-group select, .form-group textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
  .data-table { width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
  .data-table th { background: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 12px; }
  .data-table input, .data-table select { padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; width: 100%; }
  .btn-primary { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
  .btn-danger { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
  .btn-back { padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; }
  .empty { text-align: center; padding: 60px; background: white; border-radius: 12px; }
  .empty i { font-size: 64px; color: #cbd5e1; margin-bottom: 16px; }
</style>
