<script>
  import { cmsData, saveEmployeeRows } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  let cmsDataValue; const unsub = cmsData.subscribe(v => cmsDataValue = v);
  let editingIndex = null, searchQuery = '', showDeleteConfirm = false, itemToDelete = null;
  const def = { fullName: '', email: '', phone: '', position: '', department: '', status: 'Active', notes: '' };
  function handleAdd() { saveEmployeeRows([{ ...def }, ...(cmsDataValue?.employeeRows || [])]); }
  function handleRemove(i) { saveEmployeeRows((cmsDataValue?.employeeRows || []).filter((_, x) => x !== i)); }
  function handleUpdate(i, f, v) { const r = [...(cmsDataValue?.employeeRows || [])]; r[i][f] = v; saveEmployeeRows(r); }
  function requestDelete(i) { itemToDelete = i; showDeleteConfirm = true; }
  function confirmDelete() { showDeleteConfirm = false; if (itemToDelete !== null) { handleRemove(itemToDelete); itemToDelete = null; } }
  $: filtered = (cmsDataValue?.employeeRows || []).filter(x => (x.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()));
</script>
<div class="rental-section">
  {#if editingIndex !== null && cmsDataValue?.employeeRows}
    <div class="editor-fullscreen"><div class="editor-header"><button class="btn-back" on:click={() => editingIndex = null}><i class="fas fa-arrow-left"></i> Back</button><h2>Edit: {cmsDataValue.employeeRows[editingIndex]?.fullName}</h2></div>
    <div class="form-grid"><div class="form-group full"><label>Full Name *</label><input type="text" bind:value={cmsDataValue.employeeRows[editingIndex].fullName} /></div>
      <div class="form-group"><label>Email</label><input type="email" bind:value={cmsDataValue.employeeRows[editingIndex].email} /></div>
      <div class="form-group"><label>Phone</label><input type="tel" bind:value={cmsDataValue.employeeRows[editingIndex].phone} /></div>
      <div class="form-group"><label>Position</label><input type="text" bind:value={cmsDataValue.employeeRows[editingIndex].position} /></div>
      <div class="form-group"><label>Department</label><input type="text" bind:value={cmsDataValue.employeeRows[editingIndex].department} /></div>
      <div class="form-group"><label>Status</label><select bind:value={cmsDataValue.employeeRows[editingIndex].status}><option>Active</option><option>Inactive</option><option>On Leave</option></select></div>
      <div class="form-group full"><label>Notes</label><textarea bind:value={cmsDataValue.employeeRows[editingIndex].notes} rows="3"></textarea></div>
    </div></div>
  {:else}
    <div class="section-header"><h2><i class="fas fa-id-badge"></i> Employees</h2><div class="actions"><input type="text" placeholder="Search..." bind:value={searchQuery} /><button class="btn-primary" on:click={handleAdd}><i class="fas fa-plus"></i> Add</button></div></div>
    {#if filtered?.length}<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Position</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead><tbody>{#each cmsDataValue?.employeeRows || [] as item, idx}{#if filtered.includes(item)}<tr><td>{item.fullName}</td><td>{item.email}</td><td>{item.position}</td><td>{item.department}</td><td>{item.status}</td><td><button on:click={() => editingIndex = idx}>Edit</button> <button class="btn-danger" on:click={() => requestDelete(idx)}>Delete</button></td></tr>{/if}{/each}</tbody></table>{/if}
    {#if !filtered?.length}<div class="empty"><i class="fas fa-id-badge"></i><p>No employees</p><button class="btn-primary" on:click={handleAdd}>Add First</button></div>{/if}
  {/if}
  <ConfirmModal isOpen={showDeleteConfirm} title="Delete?" message="Sure?" confirmText="Delete" cancelText="Cancel" isDestructive onConfirm={confirmDelete} onCancel={() => showDeleteConfirm = false} />
</div>
<style>.rental-section{padding:20px}.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.section-header h2{font-size:24px;display:flex;align-items:center;gap:10px}.section-header h2 i{color:#2563eb}.actions{display:flex;gap:10px}.actions input{padding:8px;border:1px solid #e2e8f0;border-radius:6px}.editor-fullscreen{position:fixed;inset:0;background:white;z-index:1000;padding:20px;overflow-y:auto}.editor-header{display:flex;gap:20px;align-items:center;margin-bottom:20px}.editor-header h2{margin:0;flex:1}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;max-width:1000px}.form-group{display:flex;flex-direction:column;gap:6px}.form-group.full{grid-column:1/-1}.form-group input,.form-group select,.form-group textarea{padding:10px;border:1px solid #e2e8f0;border-radius:6px}.data-table{width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.data-table th,.data-table td{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0}.data-table th{background:#f8fafc;font-weight:600;text-transform:uppercase;font-size:12px}.btn-primary{padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600}.btn-danger{background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer}.btn-back{padding:8px 16px;background:#f1f5f9;border:none;border-radius:6px;cursor:pointer}.empty{text-align:center;padding:60px;background:white;border-radius:12px}.empty i{font-size:64px;color:#cbd5e1;margin-bottom:16px}</style>
