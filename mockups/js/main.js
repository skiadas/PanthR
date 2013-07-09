define({
    // Mockup data to use for now
    structures: {
        create: { 
            module: 'js/models/structures',
            args: [
                { $ref: 'json!js/models/madeUp.json' }
            ]
        },
    },
    topbar: {
        render: {
            template: { module: 'text!templates/topBar.html' },
            at: { $ref: 'first!#topBar' }
        }
    },
    sidebar: {
        create: 'js/views/workspace',
        properties: {
            template: { module: 'text!templates/sideBar.hbs' },
            el: { $ref: 'first!#sideBar' }
        },
        // after: {
        //     'theapp.getWorkspace': 'renderSidebar'
        // }
    },
    variableView: {
        render: {
            template: {module: 'text!templates/variableView.html' },
        }
    },
    variableEdit: {
        render: {
            template: {module: 'text!templates/variableEdit.html' },
        }
    },
    datasetView: {
        render: {
            template: { module: 'text!templates/datasetView.html' },
            at: { $ref: 'first!#tabView' }
        }
    },
    datasetEdit: {
        render: {
            template: { module: 'text!templates/datasetEdit.html' },
            at: { $ref: 'first!#tabEdit' }
        }
    },

    // Putting things together
    jqueryStuff: {
        module: 'js/jQueryStartup'
    },
    mainRouter: {
        create: 'js/routers/main',
        ready: 'startListening'
    },
    theapp: {
        create: 'js/controllers/app',
        properties: {
            router: { $ref: 'mainRouter' },
            structures: { $ref: 'structures.structures' }
        },
        ready: 'getWorkspace',
        after: {
            'getWorkspace': 'sidebar.renderSidebar'
        }
    },
    //
    //
    // Wire.js plugins
    $plugins: [
        { module: 'wire/jquery/dom', classes: { init: 'loading' } },
        { module: 'wire/dom/render' },
        'wire/jquery/ui', 'wire/jquery/on',
        'wire/aop', 'wire/connect',
        // 'wire/debug',
        'js/plugins/json'
    ]
});