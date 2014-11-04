module.exports = {
    options: {
        curly: true,
        esnext: true,
        eqeqeq: true,
        freeze: true,
        immed: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        node: true,
        noempty: true,
        nonbsp: true,
        nonew: true,
        quotmark: 'single',
        undef: true,
        unused: true
    },
    groups: {
        'src': {
            includes: [
                'lib/**/*.js',
                '*.js'
            ]
        },
        'tests': {
            options: {
                predef: [
                    'describe',
                    'it',
                    'before',
                    'beforeEach',
                    'after',
                    'afterEach'
                ],
                expr: true
            },
            includes: [
                'test/**/*.js'
            ]
        }
    }
};
