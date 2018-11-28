const { parse } = require("querystring");

module.exports = {
  DIRECTION_LEFT: 1,
  DIRECTION_RIGHT: 2,
  DEBUG: true,

  log(msg) {
    if (this.DEBUG) {
      console.log(msg);
    }
  },

  isString(val) {
    return typeof val == "string";
  },

  isNumber(val) {
    return typeof val == "number";
  },

  sanitize(val) {
    let type = typeof val;
    if (type == "number") {
      return val;
    } else if (type == "string") {
      if (val) {
        return val.trim().replace(/(<([^>]+)>)/gi, "");
      }
    }
    return "";
  },


  padNumber(num, padlen) {
    let pad = new Array(1 + padlen).join(0);
    return (pad + num).slice(-pad.length);
  },

  clamp(val, minVal, maxVal) {
    if (!isNaN(val)) {
      let value = parseInt(val);
      if (value > maxVal) {
        return maxVal;
      } else if (value < minVal) {
        return minVal;
      }
    } //if is number
    return val;
  },

  replaceCharAt(str, index, replacement) {
    return (
      str.substr(0, index) +
      replacement +
      str.substr(index + replacement.length)
    );
  },


  removePad(str, padChar, direction = this.DIRECTION_LEFT) {
    if (!this.isString()) {
      str += "";
    }
    let len = str.length;
    let counter = 0;
    switch (direction) {
      case this.DIRECTION_LEFT:
        while (counter < len - 1) {
          if (str.charAt(counter) == padChar) {
            str = this.replaceCharAt(str, counter, " ");
          } else {
            break;
          }
          ++counter;
        }
        break;
      case this.DIRECTION_RIGHT:
        while (counter < len - 1) {
          if (str.charAt(len - counter - 1) == padChar) {
            str = this.replaceCharAt(str, len - counter - 1, " ");
          } else {
            break;
          }
          ++counter;
        }
        break;
    }
    return str.trim();
  },

  getJsonContent(jsonBody, param) {
    let value = "";
    try {
      value = JSON.parse(jsonBody);
    } catch (error) {
      return jsonBody;
    }

    let result = value[param];
    if (!result) {
      return "";
    }
    return result;
  },

  getRequestBody(param, body, contentType) {
    let contentTypeU = this.sanitize(contentType).toUpperCase();
    let split = contentTypeU.split("; ");
    if (split.length > 1 && split[0] == "MULTIPART/FORM-DATA") {
      let boundary = multipart.getBoundary(contentType);
      let boundaryInner = boundary.replace(/-/g, "");
      let parts = this.sanitize(
        body
          .replace(/\r\nContent-Disposition: form-data; /g, "")
          .replace(/--/g, "")
          .replace(/\r/g, "")
          .replace(/\n/g, "")
      ).split(boundaryInner);
      for (let i = 1; i < parts.length - 1; ++i) {
        let first = parts[i].indexOf('"') + 1;
        let second = parts[i].indexOf('"', first) + 1;
        let name = parts[i].substr(first, second - first - 1);
        console.log(name);
        if (name == param) {
          return parts[i].substr(second, parts[i].length);
        }
      }
    }else{
      return this.getJsonContent(body, param);
    }
    return "";
  },

  createRandomString(length) {
    var str = "";
    for (
      ;
      str.length < length;
      str += Math.random()
        .toString(36)
        .substr(2)
    );
    return str.substr(0, length);
  },

  yyyymmdd() {
    var x = new Date();
    var y = x.getFullYear().toString();
    var m = (x.getMonth() + 1).toString();
    var d = x.getDate().toString();
    (d.length == 1) && (d = '0' + d);
    (m.length == 1) && (m = '0' + m);
    var yyyymmdd = y + m + d;
    return yyyymmdd;
  },

  getIsoDate(){
    return new Date().toISOString();
  },

  getArrayObject(arr, param, find){
    try{
      arr = JSON.parse(arr);
    }catch(e){}
    for(let i = 0; i < arr.length; ++i){
      if(typeof arr[i][param] != 'undefined' && arr[i][param] == find){
        return arr[i];
      }
    }
    return [];
  },

  /* formatTransactionResponse(ob, format) {
    return ob.map(function(obj) {
        return Object.keys(obj).sort().map(function(key) {
            return JSON.parse(`{"key": "${key}", "value": "${(obj[key]+"").replace(/\"/gi, "\\\"")}"}`);
        });
    }) */

    formatTransactionResponse(ob, format) {
      let res = ob.map(function(obj) {
        return Object.keys(obj).sort().map(function(key) {
          let typeTag = "label";
          if(key == "transactionHash"){
            typeTag = "link:txns"
          }else if (key == "from" || key == "to"){
            typeTag = "link:address"
          }else if(key == "value"){
            typeTag = "label:wei";
          }else if(key == "value"){
            typeTag = "label:wei";
          }

          /* if(key == "logs"){
            obj[key] = obj[key].replace(/\\\"/g, "\"");
            console.log(obj[key]);
            //console.log(JSON.parse(obj[key].replace(/\"/g, "")));
          } */
          return JSON.parse(`{"key": "${key}", "value": "${(obj[key]+"").replace(/\"/gi, "\\\"")}", "type": "${typeTag}"}`);
        });
      });

      for(let i = 0; i < res.length; ++i){
        for(let j = 0; j < res[i].length; ++j){
          if(res[i][j].key == "logs"){
            res[i][j].value = JSON.parse(res[i][j].value.replace(/\\\"/gi, "\""));
          }
        }
      }

      if(typeof format != "undefined" && format.length > 0){
        for(let i = 0; i < res.length; ++i){
          for(let j = 0; j < res[i].length; ++j){
            for(let k = 0; k < format.length; ++k){
              if(format[k] == res[i][j].key){
                let temp = res[i][k];
                res[i][k] = res[i][j];
                res[i][j] = temp;
              }
            }//end inner for
          }//end outer for
        }//end most outer for
      }//if format defined
      return res;
}
  
};