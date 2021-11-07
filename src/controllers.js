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

                  //fix the ($) argument for variable name

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


  


  iscd(arg){
    if(arg){
      if(arg.includes("cd") == true){
        return true;
      }else{
        return false;
      }
    }else{
      process.exit(1)
    }
  }


  /**
   * runs commands in buck_list based on executor.
   *
   * @param {String} arg executor of bucket.
   */
  async run(arg){
    try{

      let data = this.middleMan("r");
      let wordsArr = new Helpers();
      let foundBucket;

      wordsArr = wordsArr.buckToArray(data);
      for(var obj = 0; obj < wordsArr.length; obj++){

        if(arg == wordsArr[obj].executor){
          foundBucket = wordsArr[obj]
        } 
      }
      let cmdList = foundBucket.buck_list;
      for(var a = 0; a < cmdList.length; a++){

        if(this.iscd(cmdList[a])){

          let splitData = cmdList[a].split(" ");
          splitData = splitData[1];
          
          //add timer to complete a process before moving to the next
          await new Promise(resolve => setTimeout(resolve, 10));
          process.chdir(`${splitData}`);
          
          exec(`${cmdList[a]}`); 
        }else{
          await new Promise(resolve => setTimeout(resolve, 10));
          await exec(`${cmdList[a]}`, (error, stdout, stderr)=>{
             console.log(stdout);

          }); 
        }

      }
      //process.exit(1);
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



let a = new Bucket()
//a.listBucket();
a.run("sd")
//a.deleteBucket("akure");
//a.addBucket();
//a.createBucket()
//a.eraseBucket();
module.exports = {
    Bucket
};


