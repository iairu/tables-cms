<script>
  import { cmsData, saveReservationRows } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  let cmsDataValue; const unsub = cmsData.subscribe(v => cmsDataValue = v);
  let searchQuery = '', showDeleteConfirm = false, itemToDelete = null;
  function handleAdd() { saveReservationRows([{ id: Date.now().toString(), customerName: '', itemName: '', responsibleEmployee: '', startDate: new Date().toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10), status: 'Confirmed' }, ...(cmsDataValue?.reservationRows || [])]); }
  function handleRemove(i) { saveReservationRows((cmsDataValue?.reservationRows || []).filter((_, x) => x !== i)); }
  function handleUpdate(i, f, v) { const r = [...(cmsDataValue?.reservationRows || [])]; r[i][f] = v; saveReservationRows(r); }
  function requestDelete(i) { itemToDelete = i; showDeleteConfirm = true; }
  function confirmDelete() { showDeleteConfirm = false; if (itemToDelete !== null) { handleRemove(itemToDelete); itemToDelete = null; } }
  $: customers = cmsDataValue?.customerRows || [];
  $: inventory = cmsDataValue?.inventoryRows || [];
  $: employees = cmsDataValue?.employeeRows || [];
  $: filtered = (cmsDataValue?.reservationRows || []).filter(x => (x.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()));
</script>
<div class="rental-section">
  <div class="section-header"><h2><i class="fas fa-calendar-check"></i> Reservations</h2><div class="actions"><input type="text" placeholder="Search..." bind:value={searchQuery} /><button class="btn-primary" on:click={handleAdd}><i class="fas fa-plus"></i> Add</button></div></div>
  {#if filtered?.length}
    <table class="data-table"><thead><tr><th>Customer</th><th>Item</th><th>Employee</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    {#each cmsDataValue?.reservationRows || [] as item, idx}{#if filtered.includes(item)}
      <tr>
        <td><select bind:value={item.customerName}><option value="">Select</option>{#each customers as c}<option value={c.fullName}>{c.fullName}</option>{/each}</select></td>
        <td><select bind:value={item.itemName}><option value="">Select</option>{#each inventory as i}<option value={i.itemName}>{i.itemName}</option>{/each}</select></td>
        <td><select bind:value={item.responsibleEmployee}><option value="">Select</option>{#each employees as e}<option value={e.fullName}>{e.fullName}</option>{/each}</select></td>
        <td><input type="date" bind:value={item.startDate} /></td>
        <td><input type="date" bind:value={item.endDate} /></td>
        <td><select bind:value={item.status}><option>Confirmed</option><option>Pending</option><option>Cancelled</option><option>Completed</option></select></td>
        <td><button class="btn-danger" on:click={() => requestDelete(idx)}>Delete</button></td>
      </tr>
    {/if}{/each}</tbody></table>
  {:else}<div class="empty"><i class="fas fa-calendar-check"></i><p>No reservations</p><button class="btn-primary" on:click={handleAdd}>Add First</button></div>{/if}
  <ConfirmModal isOpen={showDeleteConfirm} title="Delete?" message="Sure?" confirmText="Delete" cancelText="Cancel" isDestructive onConfirm={confirmDelete} onCancel={() => showDeleteConfirm = false} />
</div>
<style>.rental-section{padding:20px}.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.section-header h2{font-size:24px;display:flex;align-items:center;gap:10px}.section-header h2 i{color:#2563eb}.actions{display:flex;gap:10px}.actions input{padding:8px;border:1px solid #e2e8f0;border-radius:6px}.data-table{width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow-x:auto}.data-table th,.data-table td{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0;white-space:nowrap}.data-table th{background:#f8fafc;font-weight:600;text-transform:uppercase;font-size:12px}.data-table input,.data-table select{padding:6px;border:1px solid #e2e8f0;border-radius:4px}.btn-primary{padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600}.btn-danger{background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer}.empty{text-align:center;padding:60px;background:white;border-radius:12px}.empty i{font-size:64px;color:#cbd5e1;margin-bottom:16px}</style>
