const processParams = [
    { name: 'Icon', value: 'icon', placeholder: '🖼️' },
    { name: 'Title', value: 'data.exe_name', placeholder: '—' },
    { name: 'Path', value: 'data.exe_path', placeholder: '—' },
    { name: 'Active for', value: 'activeFor', placeholder: 'Inactive' },
    { name: 'RAM', value: 'data.ram_usage', placeholder: '0 ', unit: ' B' },
    { name: 'PID', value: 'data.pid', placeholder: '—' },
    { name: 'PPID', value: 'data.ppid', placeholder: '—' },
    { name: 'Threads', value: 'data.started_threads', placeholder: '0' },
    { name: 'Priority', value: 'data.priority_class', placeholder: '—' },
    { name: 'Base Priority', value: 'data.base_priority', placeholder: '—' },
    { name: 'Affinity (Process)', value: 'data.process_affinity', placeholder: '—' },
    { name: 'Affinity (System)', value: 'data.system_affinity', placeholder: '—' },
    { name: 'CPU', value: 'cpu_usage', placeholder: '0', unit: '%'},
    { name: 'Tracked', value: 'is_tracked', placeholder: false },
    { name: 'Active', value: 'is_active', placeholder: false },
    { name: 'Updated', value: 'was_updated', placeholder: false },

];

module.exports = { processParams };