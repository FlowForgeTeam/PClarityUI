const headerConfig = {
    homepage: {
        title: 'Home',
        hasSearchBar: true,
        // hasViewModes: false,
        // viewModes: {

        // }
    },
    statistics: {
        title: 'App statistics',
        hasSearchBar: true,
        hasViewModes: true,
        viewModes: [
            { icon: 'list-icon.svg', name: 'list' },
            { icon: 'grid-icon.svg', name: 'grid' },
            { icon: 'calendar-icon.svg', name: 'calendar' }
        ]
    },
    welfare: {
        title: 'System welfare',
        hasSearchBar: true,
        hasViewModes: false,
        // viewModes: {
        //     icon: 'oaoaoa'
        // }
    },
    themes: {
        title: 'Themes',
        hasSearchBar: false,
        hasViewModes: false,
    },
    settings: {
        title: 'Settings',
        hasSearchBar: false,
        hasViewModes: false,
    },
}

module.exports = { headerConfig };