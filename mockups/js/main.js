define({
    mainRouter: {
        create: 'js/routers/main',
        ready: 'startListening'
    },
    // Mockup data to use for now
    structures: {
        create: { 
            module: 'js/models/structures',
            args: [
                { $ref: 'json!js/models/madeUp.json' }
            ]
        },
    },
    //
    // 
    topbar: {
        render: {
            template: { module: 'text!templates/topBar.html' },
            at: { $ref: 'first!#topBar' }
        }
    },
    sidebar: {
        render: {
            template: { module: 'text!templates/sideBar.html' },
            at: { $ref: 'first!#sideBar' }
        }
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
    app: {
        create: 'js/controllers/app',
        properties: {
            router: { $ref: 'mainRouter' }
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