#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');




program
    .version('0.0.7')
    .description(chalk.white('Buck'))



program
    .command('--list')
    .alias('-l')
    .description(chalk.yellow('List all your buckets'))
    .action(() => {
        
    })

program
    .command('--create')
    .alias('-c')
    .description(chalk.yellow('create a new bucket'))
    .action(() => {
        
    })

program
    .command('--add <name>')
    .alias('-a <name>')
    .description(chalk.yellow('add a new bucket from the cloud'))
    .action(() => {
        
    })

program
    .command('--delete <name>')
    .alias('-d <name>')
    .description(chalk.yellow('delete a bucket'))
    .action(() => {
        
    })


program
    .command('--erase')
    .alias('-e')
    .description(chalk.yellow('clear all your buckets'))
    .action(() => {
        
    })

program
    .command('')
    .alias('')
    .description(chalk.yellow('Run a bucket'))
    .action(() => {
        
    })


program.parse(process.argv);