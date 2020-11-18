  var crypto = window.crypto ;

  /**
  * read file content.
  * @param {file} - file object.
  * @return  {promise} file content
  *
  */
  async function readFile(file) {
      var reader = new FileReader();
      var deferred = $.Deferred();

      reader.onload = function(event) {
          deferred.resolve(event.target.result);
      };

      reader.onerror = function() {
          deferred.reject(this);
      };
      if (/^application.pdf/.test(file.type) ||  /^image.*/.test(file.type))
        reader.readAsArrayBuffer(file);
      else if (/^application.json/.test(file.type)) {
          reader.readAsText(file);
      } else {
          reader.readAsBinaryString(file);
      }

      return deferred.promise();
  }

  /**
  * save file
  * @param {file} - file object.
  * @param {String} - file name.
  *
  *
  */
  function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        try {
            file.type = 'video/webm';
        } catch (e) {}
    }

    var fileExtension = (file.type || 'video/webm').split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.download = fileFullName;

    hyperlink.style = 'display:none;opacity:0;color:transparent;';
    (document.body || document.documentElement).appendChild(hyperlink);

    if (typeof hyperlink.click === 'function') {
        hyperlink.click();
    } else {
        hyperlink.target = '_blank';
        hyperlink.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }

    (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
  }



  /**
  * Convert an ArrayBuffer to  a hex string .
  * @param {ArrayBuffer} - The bytes in an ArrayBuffer.
  * @return  {string} hexString - hex representation of bytes
  *
  */

    function convertArrayBufferToHexa(buffer)
    {
        let i, len, hex = '', c;


        let data_view = new DataView(buffer);
        len = data_view.byteLength;
        for(i = 0; i < len; i++)
        {
            c = data_view.getUint8(i).toString(16);
            if(c.length < 2)
            {
                c = '0' + c;
            }

            hex += c;
        }

        return hex;
    }

    /**
   * Convert a hex string to an ArrayBuffer.
   *
   * @param {string} hexString - hex representation of bytes
   * @return {ArrayBuffer} - The bytes in an ArrayBuffer.
   */
  function hexStringToArrayBuffer(hexString) {
      // remove the leading 0x
      hexString = hexString.replace(/^0x/, '');

      // ensure even number of characters
      if (hexString.length % 2 != 0) {
          console.log('WARNING: expecting an even number of characters in the hexString');
      }

      // check for some non-hex characters
      var bad = hexString.match(/[G-Z\s]/i);
      if (bad) {
          console.log('WARNING: found non-hex characters', bad);
      }

      // split the string into pairs of octets
      var pairs = hexString.match(/[\dA-F]{2}/gi);

      // convert the octets to integers
      var integers = pairs.map(function(s) {
          return parseInt(s, 16);
      });

      var array = new Uint8Array(integers);
      console.log(array);

      return array.buffer;
  }


  function ascii(lettre)
  {
    return lettre.charCodeAt(0);
  }

  /**
 * Convert string to byte array
 *
 * @param {str} String -
 * @return {} Uint8Array  - The bytes in an ArrayBuffer.
 */
  function convertStringToByteArray(str)
  {
    return Uint8Array.from(str.split('').map(ascii));
  }


  //Convert file size
  function FileConvertSize(aSize){
  	aSize = Math.abs(parseInt(aSize, 10));
  	var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
  	for(var i=0; i<def.length; i++){
  		if(aSize<def[i][0]) return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
  	}
  }

  function importPublicKey(jwk) {
    return window.crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "ECDSA",
        namedCurve: "P-384"
      },
      true,
      ["verify"]
    );
  }


  async function verifyMessage(publicKey,signature,messageEncoded) {

    let result = await window.crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: {name: "SHA-384"},
      },
      publicKey,
      signature,
      messageEncoded
    );
     return result;
    }


    function importPrivateKey(jwk) {
      return window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
          name: "ECDSA",
          namedCurve: "P-384"
        },
        true,
        ["sign"]
      );
    }

  async function asyncReadkey(file,type){
    promise= readFile(file);
    data =await promise;
    var key=jQuery.parseJSON( data );
    return [key,type,file];
  }
  async function asyncReadFile(file){
    promise= readFile(file[0]);
    data =await promise;
    return [data,file];
  }

  async function getPdfContent(pdfBytes){
    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(pdfBytes);

       //ignorer les champs suivants
       pdfDoc.setKeywords([]);
       pdfDoc.setProducer('');
       pdfDoc.setModificationDate(new Date('2000-01-01T00:00:00'));
       return await pdfDoc.save();
  }
  async function getPdfKeywordsContent(pdfBytes){
    // Load a PDFDocument without updating its existing metadata
    const pdfDoc = await PDFDocument.load(pdfBytes, {
        updateMetadata: false
      });
       return pdfDoc.getKeywords();
  }

  async function setDocumentMetadata(pdfBytes,signature,author,fileName) {
    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(pdfBytes);

       pdfDoc.setKeywords([signature+"#",JSON.stringify(author,null,2)+"#",moment().format('DD-MM-YYYY HH:mm')]);
       // Serialize the PDFDocument to bytes (a Uint8Array)
        pdfBytes = await pdfDoc.save();
      // Trigger the browser to download the PDF document
       download(pdfBytes, fileName, "application/pdf");
     }

     //validate an email address using a regular expression
     function ValidateEmail(mail)
     {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
      return true;
     return false;
     }
     //validate a name using a regular expression
     function ValidateName(name)
     {console.log(name);
      if (/^([A-Za-zàâäéèêëïîôöùûüÿç]+[\-\' ]?)+$/.test(name))
        return true;

      return false;

     }
