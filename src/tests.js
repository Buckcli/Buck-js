const chai = require('chai');
const chaiHttp = require('chai-http');
const helpers = require("./helpers.js");
const bucket = require("./controllers.js");


const Helpers = helpers.Helpers;
const Bucket = bucket.Bucket;


process.env['NODE_ENV'] = 'test';




chai.should();

chai.use(chaiHttp);


describe("BUCK", () => {
	it("Should return read file and return data as string", async () => {

		let newBucket = new Bucket(); 
    	let data = newBucket.middleMan("r");
        data.should.be.a('string');
        
    });


    it("Should return read data as an array", async () => {

		let newBucket = new Bucket(); 
		let wordsArr = new Helpers();

    	let data = newBucket.middleMan("r");
      	wordsArr = wordsArr.buckToArray(data);
      	
        wordsArr.should.be.a('array');

    });
});
