<script>
  import { cmsData } from '../../../stores/cmsData.js';
  let cmsDataValue; const unsub = cmsData.subscribe(v => cmsDataValue = v);
  let currentDate = new Date();
  $: { const s = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); s.setDate(s.getDate() - s.getDay()); const e = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); e.setDate(e.getDate() + (6 - e.getDay())); let d = new Date(s); calendarDays = []; while (d <= e) { calendarDays.push(new Date(d)); d.setDate(d.getDate() + 1); } }
  let calendarDays = [];
  $: reservationsByDate = (() => { const m = {}; (cmsDataValue?.reservationRows || []).forEach(r => { let d = new Date(r.startDate); while (d <= new Date(r.endDate)) { const k = d.toISOString().slice(0,10); if (!m[k]) m[k] = []; m[k].push(r); d.setDate(d.getDate() + 1); } }); return m; })();
  function prevMonth() { currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); }
  function nextMonth() { currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1); }
  function strColor(s) { if (!s) return '#e0e7ff'; let h = 0; for (let i = 0; i < s.length; i++) { h = s.charCodeAt(i) + ((h << 5) - h); } return `hsl(${Math.abs(h) % 360}, 70%, 85%)`; }
</script>
<div class="rental-calendar">
  <div class="cal-header"><h2><i class="fas fa-calendar-alt"></i> Calendar</h2><div class="cal-nav"><button class="btn" on:click={prevMonth}><i class="fas fa-chevron-left"></i></button><span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><button class="btn" on:click={nextMonth}><i class="fas fa-chevron-right"></i></button></div></div>
  <div class="cal-grid">
    {#each ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as d}<div class="cal-day-hdr">{d}</div>{/each}
    {#each calendarDays as day}
      {#if (function(){ const ds = day.toISOString().slice(0,10); const res = reservationsByDate[ds] || []; return true; })()}
        {#if (function(){ const ds = day.toISOString().slice(0,10); const res = reservationsByDate[ds] || []; })()}
        {/if}
      {/if}
    {/each}
  </div>
</div>
<style>.rental-calendar{padding:20px}.cal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.cal-header h2{font-size:24px;display:flex;align-items:center;gap:10px}.cal-header h2 i{color:#2563eb}.cal-nav{display:flex;align-items:center;gap:16px}.cal-nav span{font-size:18px;font-weight:600}.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}.cal-day-hdr{padding:12px;font-weight:600;text-align:center;background:#f8fafc;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}.cal-day{padding:8px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;min-height:80px}.cal-day-num{font-weight:600;margin-bottom:8px;font-size:14px}.cal-res{font-size:11px;padding:4px;margin-bottom:4px;border-radius:4px;overflow:hidden}.btn{padding:8px 16px;border:1px solid #e2e8f0;border-radius:6px;background:white;cursor:pointer}</style>
