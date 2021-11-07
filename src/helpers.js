


class Helpers{


	/**
	 * convert buckets in file into array.
	 *
	 *find "{" and "}" in data string and return their index into an array,
	 *pick the indices as pair(a, b) and slice, returning all the characters
	 *between those pairs(which is starts from { and ends with }), then parse 
	 *as JSON and push to array
	 *
	 * @param {String} data data gotten from data.json.
	 * @return {array} wordsArr an array of buckets.
	 */
	buckToArray(data){
	  let emptyArr = [];
      let wordsArr = [];

      for(var i=0; i < data.length; i++){
        if (data[i] === "{" || data[i] === "}") {
          emptyArr.push(i)
        }
      }

      let a = 0;
      let b = 2;
      let buckObj;
      for(var j=0; j < emptyArr.length/2; j++){

        let arraySlice = emptyArr.slice(a, b);
        buckObj = data.slice(arraySlice[0], arraySlice[1]+1)

        //push unique objects
        if(wordsArr.indexOf(JSON.parse(buckObj)) === -1) {
            wordsArr.push(JSON.parse(buckObj));
        }

        a += 2;
        b += 2;
      }

      return wordsArr;
	}

}


module.exports = {
    Helpers
};