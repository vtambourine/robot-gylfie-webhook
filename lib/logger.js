import winston from 'winston'

// winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            colorize: true
        })
    ]
})

export default logger
