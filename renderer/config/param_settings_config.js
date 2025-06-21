const parametersSettings = [
    {
        header: 'Program Icon',
        explanation: 'Enable tracking of program icons to visually identify running applications.',
        setting_name: 'monitoring.iconTracking'
    },
    {
        header: 'Executable Name',
        explanation: 'Enable tracking of executable names to distinguish between different processes.',
        setting_name: 'monitoring.exeNameTracking'
    },
    {
        header: 'Executable Path',
        explanation: 'Enable tracking of executable paths to locate where each application runs from.',
        setting_name: 'monitoring.exePathTracking'
    },
    {
        header: 'Active Duration',
        explanation: 'Enable tracking of app activity time to monitor how long it stays in use.',
        setting_name: 'monitoring.activeDurationTracking'
    },
    {
        header: 'RAM Usage',
        explanation: 'Enable tracking of RAM usage to monitor memory consumption by each process.',
        setting_name: 'monitoring.ramTracking'
    },
    {
        header: 'Process ID',
        explanation: 'Enable tracking of process IDs to uniquely identify each running instance.',
        setting_name: 'monitoring.pidTracking'
    },
    {
        header: 'Parent Process ID',
        explanation: 'Enable tracking of parent process IDs to understand process hierarchy.',
        setting_name: 'monitoring.ppidTracking'
    },
    {
        header: 'Thread Count',
        explanation: 'Enable tracking of thread count to assess how much concurrency each app uses.',
        setting_name: 'monitoring.threadsTracking'
    },
    {
        header: 'Priority Class',
        explanation: 'Enable tracking of priority classes to see how the OS prioritizes each process.',
        setting_name: 'monitoring.priorityTracking'
    },
    {
        header: 'Base Priority',
        explanation: 'Enable tracking of base priorities to check default process execution levels.',
        setting_name: 'monitoring.basePriorityTracking'
    },
    {
        header: 'Process Affinity',
        explanation: 'Enable tracking of process affinity to observe assigned CPU cores.',
        setting_name: 'monitoring.processAffinityTracking'
    },
    {
        header: 'System Affinity',
        explanation: 'Enable tracking of system affinity to understand the total CPU availability.',
        setting_name: 'monitoring.systemAffinityTracking'
    },
    {
        header: 'CPU Usage',
        explanation: 'Enable tracking of CPU usage to help identify performance bottlenecks.',
        setting_name: 'monitoring.cpuTracking'
    },
    {
        header: 'Tracked',
        explanation: 'Enable tracking status to remember which apps you monitor over time.',
        setting_name: 'monitoring.trackedTracking'
    },
    {
        header: 'Currently Active',
        explanation: 'Enable detection of active status to know which app is in the foreground.',
        setting_name: 'monitoring.activeStatusTracking'
    },
    {
        header: 'Recently Updated',
        explanation: 'Enable update status to identify if the app data changed this interval.',
        setting_name: 'monitoring.updatedStatusTracking'
    }
];

module.exports = { parametersSettings };