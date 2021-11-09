const fs = require('fs');
const readline = require("readline");
const path = require("path");
const helpers = require("./helpers.js");
const process = require('process');
const { exec } = require("child_process");
const { spawn } = require("child_process");


const Helpers = helpers.Helpers;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});




class Bucket {

  constructor(name,executor,commandList,description) {
    this.name = name;
    this.executor = executor;
    this.commandList = commandList;
    this.description = description;
  }


  /**
   * interacts with local db to read, write, append or truncate data.
   *
   * @param {String} arg the function to perform on data.
   * @param {Object} data new JSON created.
   */
  middleMan(arg, data){
    try{
      let filepath = path.join(__dirname, './buck-data/data.json');

      //process data for writing and appending
      let dataString = JSON.stringify(data, null, 2)
      let dumpedData= '\n'+dataString+','


      if(arg == "r"){

        var data = fs.readFileSync(filepath, 'utf8');
        return data;

      }else if(arg == "a"){

        var appendData = fs.appendFileSync(filepath, dumpedData)
        return;

      }else if(arg =="w"){

        var writeData = fs.writeFileSync(filepath, dumpedData)
        return;

      }else if(arg =="t"){

        var truncData = fs.truncateSync(filepath, 0)
        return;

      }else{
        return filepath;
      }

    }catch(err){
      if (err.code === 'ENOENT') {
        console.log(">> Cannot locate data file :  " + filePath);
        process.exit(1);
      }else{
        console.log(">> Error");
        process.exit(1);
      }
    }
  }



  /**
   * creates a new bucket and add to local db.
   *
   * @param {String} name name of bucket
   * @param {String} commands action words to be carried out on terminal separated by commas.
   * @param {String} executor action word to trigger commands.
   * @param {String} description description of bucket.
   */
  createBucket(){
    try{
      console.log(' >> Howdy! Create A New Bucket ')
      rl.question(" Name : ", function(name) {
        console.log('\n >> Seperate commands with a comma')
          rl.question(" Commands : ", function(commands) {
              rl.question("\n Executor : ", function(executor) {
                rl.question("\n Description : ", function(description) {

                  let commandList = commands.split(",");
                  let data = new Bucket(name, executor, commandList, description);


                  let newData = {
                    "name": data.name,
                    "executor": data.executor,
                    "buck_list": data.commandList,
                    "description": data.description
                  };

                  data.middleMan("a",newData);
                    
                  console.log('\n >> yay! it is done ');

                  rl.close();
              });
            });
          });
      });
    }catch(err){
      console.log("\n >> KeyboardInterrupt :  Process terminated !")
    }
  }


  /**
   * lists all buckets found in local db 
   *(-l <name> - lists based on bucket's name).
   *
   * @param {String} arg name of bucket.
   */
  listBucket(arg){
    let foundBucket;
    let data = this.middleMan("r");
    let wordsArr = new Helpers();
    wordsArr = wordsArr.buckToArray(data);
    //listing a specific bucket
    if(arg){
      for(var obj = 0; obj < wordsArr.length; obj++){

        if(arg == wordsArr[obj].name){
          foundBucket = wordsArr[obj]
        }  
      }
      if(foundBucket != undefined){
        console.log(' >> Here you go : \n');
        console.log(JSON.stringify(foundBucket, null, 2));
        process.exit(1);
      }else{
        console.log('No bucket with that name');
        process.exit(1);
      }
      

    }else{
      //listing all buckets
      if (data){
        console.log('{ "bucket" : ')
        console.log(`  ${JSON.stringify(wordsArr, null, 2)}`);
        console.log('}');
        process.exit(1);
      }else{
        console.log(">> no data");
      }
    }
  }


  


  /**
   * runs commands in buck_list based on executor.
   *
   * @param {String} arg executor of bucket.
   * @param {String} arg2 variable name to replace $.
   */
  async run(arg, arg2){
    try{

      let data = this.middleMan("r");
      let helper = new Helpers();
      let foundBucket;

      let wordsArr = helper.buckToArray(data);
      for(var obj = 0; obj < wordsArr.length; obj++){

        if(arg == wordsArr[obj].executor){
          foundBucket = wordsArr[obj]
        } 
      }
      if(foundBucket != undefined){
        let cmdList = foundBucket.buck_list;
        for(var a = 0; a < cmdList.length; a++){

          if(helper.iscd(cmdList[a])){

            let splitData = cmdList[a].split(" ");
            if(arg2){
              splitData = arg2;
            }else{
              splitData = splitData[1];
            }
            
            
            //add timer(10ms) to complete a process before moving to the next
            await new Promise(resolve => setTimeout(resolve, 100));
            process.chdir(`${splitData}`);
            
            exec(`${cmdList[a]}`); 
          }else if(cmdList[a].includes(" $")){

            //handle if $ in bucklist commands
            if(arg2){
              let replaceString = cmdList[a].replace(" $", ` ${arg2}`);
              cmdList[a] = replaceString;
              await new Promise(resolve => setTimeout(resolve, 100));
              await exec(`${cmdList[a]}`, (error, stdout, stderr)=>{
                 console.log(stdout);
              }); 
            }else{
              console.log("\n >> This command should take in an extra argument");
              process.exit(1);
            }
            
          }else{
            await new Promise(resolve => setTimeout(resolve, 100));
            await exec(`${cmdList[a]}`, (error, stdout, stderr)=>{
               console.log(stdout);
            }); 
          }

        }
        if(cmdList.length < 2){
          console.log('>> Done! executed 1 command.');
        }else{
          console.log('>> Done! executed '+ cmdList.length + ' commands.');
        }
        
        //process.exit(1);
      }else{
        console.log('>> Cannot run command for unknown bucket');
        //process.exit(1);
      }
      
    }catch(err){
      console.log(err)
      console.log(">> Error");
      process.exit(1);
    }
  }



  /**
   * deletes all buckets from local db.
   */
  eraseBucket(){
    rl.question('\n>> This would wipe out your bucket data ! , "y" or "n" : ', (ans) => {
      if(ans == "y" || ans == "Y"){

        let newBucket = new Bucket();
        let file = newBucket.middleMan("","");
        fs.writeFile(file, "", (err) => {
          return;
        });

        console.log('\n>> Your bucket is now empty.  ');
      }else if(ans == "n" || ans == "N"){
        console.log("\n>> Process Terminated...");
        process.exit(1);
      }else{
        console.log("\n>> error :  You did not enter a valid input, try again !");
        process.exit(1);
      }

      rl.close();
    });
  }


  addBucket(){

  }



  /**
   * deletes bucket from local db based on bucket's name.
   *
   * @param {String} arg name of bucket.
   */
  deleteBucket(arg){
    try{

      let data = this.middleMan("r");
      let wordsArr = new Helpers();
      wordsArr = wordsArr.buckToArray(data);

      rl.question(`Are you sure you want to delete this bucket! , "y" or "n" : `, (ans) => {

        if(ans == "Y" || ans == "y"){

          //delete data.json bucket
          let newBucket = new Bucket();
         
          newBucket.middleMan("t")

          //search through except the last object 'cause it has been deleted and returns undefined
          for(var obj = 0; obj < wordsArr.length; obj++){

            if(wordsArr[obj].name == arg){
              wordsArr.splice(obj, 1); 
            } 
            
            //add new buckets from list
            let data = new Bucket(
              wordsArr[obj].name, 
              wordsArr[obj].executor, 
              wordsArr[obj].buck_list, 
              wordsArr[obj].description
            );


            let newData = {
              "name": data.name,
              "executor": data.executor,
              "buck_list": data.commandList,
              "description": data.description
            };

            data.middleMan("a",newData);
            

          }
          console.log('\n>> Done !  ');
          process.exit(1);

        }else if(ans == "n" || ans == "N"){
          console.log("\n>> Process Terminated...");
          process.exit(1);
        }else{
          console.log("\n>> error :  You did not enter a valid input, try again !");
          process.exit(1);
        }

      });

    }catch(err){
      console.log(">> Error");
      process.exit(1);
    }

  }
}



module.exports = {
    Bucket
};


