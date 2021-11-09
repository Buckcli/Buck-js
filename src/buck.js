#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');
const buckets = require("./controllers.js");



const Bucket = buckets.Bucket;
let bucket = new Bucket();


program
    .version('0.0.7')
    .description(chalk.white('Buck'))



program
    .command('--list')
    .alias('-l')
    .description(chalk.yellow('List all your buckets'))
    .action((bucketName) => {
        bucket.listBucket(bucketName);
    })

program
    .command('--create')
    .alias('-c')
    .description(chalk.yellow('create a new bucket'))
    .action(() => {
        bucket.createBucket();
    })

program
    .command('--add <name>')
    .alias('-a <name>')
    .description(chalk.yellow('add a new bucket from the cloud'))
    .action((bucketName) => {
        bucket.addBucket(bucketName);
    })

program
    .command('--delete <name>')
    .alias('-d <name>')
    .description(chalk.yellow('delete a bucket'))
    .action((bucketName) => {
       bucket.deleteBucket(bucketName); 
    })


program
    .command('--erase')
    .alias('-e')
    .description(chalk.yellow('clear all your buckets'))
    .action(() => {
        bucket.eraseBucket(); 
    })

program
    .command(' <executor> <variableName>')
    .alias('<executor> <variableName>')
    .description(chalk.yellow('Run a bucket'))
    .action((executor, variableName) => {
        bucket.run(executor, variableName);
    })


program.parse(process.argv);