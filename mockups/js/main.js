define({
    // Mockup data to use for now
    structures: {
        create: { 
            module: 'js/models/structures',
            args: [
                { $ref: 'json!js/models/madeUp.json' }
            ]
        },
        properties: {
            models: {
                'dataset': { module: 'js/models/dataset' },
                'variable': { module: 'js/models/variable' },
                'folder': { module: 'js/models/folder' },
                'workspace': { module: 'js/models/workspace' }
            }
        }
    },
    //
    // VIEWS
    //
    topbar: {
        render: {
            template: { module: 'text!templates/topBar.html' },
            at: { $ref: 'first!#topBar' }
        }
    },
    sidebar: {
        create: 'js/views/sidebar',
        properties: {
            template: { module: 'text!templates/sideBar.hbs' },
            el: { $ref: 'first!#sideBar' }
        },
        connect: {
            'mainRouter.getStructure': 'highlightActive'
        }
    },
    breadcrumbs: {
        create: 'js/views/breadcrumbs',
        properties: {
            template: { module: 'text!templates/breadcrumbs.hbs' },
            el: { $ref: 'first!#breadcrumbs' }
        },
        after: { 'theapp.activeStructure': 'render' }
    },
    variableView: { 
        create: 'js/views/variable',
        properties: {
            templates: { 
                view: { module: 'text!templates/variableView.hbs' },
                edit: { module: 'text!templates/variableEdit.hbs' }
            }
        }
    },
    datasetView: {
        create: 'js/views/dataset',
        properties: {
            templates: { 
                view: { module: 'text!templates/datasetView.hbs' },
                edit: { module: 'text!templates/datasetEdit.hbs' }
            },
        }
    },
    folderView: {
        create: 'js/views/folder',
        properties: {
            templates: { 
                view: { module: 'text!templates/folderView.hbs' },
                edit: { module: 'text!templates/folderEdit.hbs' }
            },
        }
    },
    workspaceView: {
        create: 'js/views/workspace',
        properties: {
            templates: { 
                view: { module: 'text!templates/workspaceView.hbs' },
                edit: { module: 'text!templates/workspaceEdit.hbs' }
            },
        }
    },
    //
    // Putting things together
    // Control
    //
    jqueryStuff: {
        module: 'js/jQueryStartup'
    },
    mainRouter: {
        create: 'js/routers/main',
        ready: 'startListening',
    },
    tabView: {
        create: 'js/views/tab',
        properties: {
            el: { $ref: 'first!#mainTab' },
            editel: { $ref: 'first!#tabEdit' },
            viewel: { $ref: 'first!#tabView' },
            views: {
                'dataset': { $ref: 'datasetView' },
                'variable': { $ref: 'variableView' },
                'folder': { $ref: 'folderView' },
                'workspace': { $ref: 'workspaceView' }
            }
        },
        after: {
            theapp: {
                'activeStructure': 'render'
            }
        }
    },
    theapp: {
        create: 'js/controllers/app',
        properties: {
            router: { $ref: 'mainRouter' },
            structures: { $ref: 'structures' }
        },
        ready: 'getWorkspace',
        connect: {
            'mainRouter.getStructure': 'activeStructure',
        },
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
        'js/plugins/json',
        // 'js/plugins/backbone/events'
    ]
});