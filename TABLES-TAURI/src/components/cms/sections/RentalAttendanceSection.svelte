<script>
  import { cmsData, saveAttendanceRows } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  let cmsDataValue; const unsub = cmsData.subscribe(v => cmsDataValue = v);
  let searchQuery = '', showDeleteConfirm = false, itemToDelete = null;
  function handleAdd() { saveAttendanceRows([{ id: Date.now().toString(), employeeName: '', date: new Date().toISOString().slice(0,10), timeIn: '09:00', timeOut: '' }, ...(cmsDataValue?.attendanceRows || [])]); }
  function handleRemove(i) { saveAttendanceRows((cmsDataValue?.attendanceRows || []).filter((_, x) => x !== i)); }
  function handleUpdate(i, f, v) { const r = [...(cmsDataValue?.attendanceRows || [])]; r[i][f] = v; saveAttendanceRows(r); }
  function requestDelete(i) { itemToDelete = i; showDeleteConfirm = true; }
  function confirmDelete() { showDeleteConfirm = false; if (itemToDelete !== null) { handleRemove(itemToDelete); itemToDelete = null; } }
  $: employees = cmsDataValue?.employeeRows || [];
  $: filtered = (cmsDataValue?.attendanceRows || []).filter(x => (x.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()));
</script>
<div class="rental-section">
  <div class="section-header"><h2><i class="fas fa-clipboard-list"></i> Attendance</h2><div class="actions"><input type="text" placeholder="Search..." bind:value={searchQuery} /><button class="btn-primary" on:click={handleAdd}><i class="fas fa-plus"></i> Add</button></div></div>
  {#if filtered?.length}
    <table class="data-table"><thead><tr><th>Employee</th><th>Date</th><th>Time In</th><th>Time Out</th><th>Actions</th></tr></thead><tbody>
    {#each cmsDataValue?.attendanceRows || [] as item, idx}{#if filtered.includes(item)}
      <tr>
        <td><select bind:value={item.employeeName}><option value="">Select</option>{#each employees as e}<option value={e.fullName}>{e.fullName}</option>{/each}</select></td>
        <td><input type="date" bind:value={item.date} /></td>
        <td><input type="time" bind:value={item.timeIn} /></td>
        <td><input type="time" bind:value={item.timeOut} /></td>
        <td><button class="btn-danger" on:click={() => requestDelete(idx)}>Delete</button></td>
      </tr>
    {/if}{/each}</tbody></table>
  {:else}<div class="empty"><i class="fas fa-clipboard-list"></i><p>No records</p><button class="btn-primary" on:click={handleAdd}>Add First</button></div>{/if}
  <ConfirmModal isOpen={showDeleteConfirm} title="Delete?" message="Sure?" confirmText="Delete" cancelText="Cancel" isDestructive onConfirm={confirmDelete} onCancel={() => showDeleteConfirm = false} />
</div>
<style>.rental-section{padding:20px}.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.section-header h2{font-size:24px;display:flex;align-items:center;gap:10px}.section-header h2 i{color:#2563eb}.actions{display:flex;gap:10px}.actions input{padding:8px;border:1px solid #e2e8f0;border-radius:6px}.data-table{width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.data-table th,.data-table td{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0}.data-table th{background:#f8fafc;font-weight:600;text-transform:uppercase;font-size:12px}.data-table input,.data-table select{padding:6px;border:1px solid #e2e8f0;border-radius:4px}.btn-primary{padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600}.btn-danger{background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer}.empty{text-align:center;padding:60px;background:white;border-radius:12px}.empty i{font-size:64px;color:#cbd5e1;margin-bottom:16px}</style>
