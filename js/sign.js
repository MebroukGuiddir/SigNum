const { PDFDocument, StandardFonts,rgb } = PDFLib;
var files=[],
 key=null,
 image=null;
$(document).ready(function(){
  //**********set drop zone************///
  $('#sig-fileupload').fileupload({
    dropZone: $('#sig-file-dropzone')
  });
  //***upload a new doc*****//
  $("#sig-fileupload").fileupload({
    add: function(e, data) {

      data.files.forEach((file, i) => {
        type=file.name.split('.');
        //only pdf files are accepted
        if(type[1]!='pdf'){
          alert('error:file type '+type[1]+' not accepted!')
          throw 'error:file type '+type[1]+' not accepted!';
        }
        //
        const rectangle={insert:false,page:1,x:0,y:0,width:0,height:0};
        //ajouter le fichier à la list files

        files.push([file,rectangle]);

        //afficher dans la dropzone
        data.context = $('<tr ></tr>')
        .append($('<td></td>').append('<input type="checkbox" id="checkbox" name="sig-file-check" class="toggle"/>'))
        .append($('<td  ></td>')
        .append($(' <img src="images/filemanager/'+type[1]+'.png" width="30" height="30" alt="'+type[1]+'"> ')) )
        .append($('<td></td>').text(file.name))
        .append($('<td></td>').text(FileConvertSize(parseInt(file.size))))

        .appendTo($("#sig-file-list"));
        $("#sig-file-scroll").prop("class","p-2");

      });
    },
  });
  //**********set dropZone***********//
  $('#sig-keyupload').fileupload({
    dropZone: $('#sig-key-dropzone')
  });
  //*********upload key***************//
  $("#sig-keyupload").fileupload({
    add: function(e, data) {
      data.files.forEach((file, i) => {

        type=file.name.split('.');
        if(type[1]!='sig'){
          alert('error:file type '+type[1]+' not accepted!')
          throw 'error:file type '+type[1]+' not accepted!';
        }
        key=file;
        // afficher la clé
        data.context = $('<tr ></tr>')
        .append($('<td></td>').append('<input type="checkbox" id="checkbox" name="sig-key-check" class="toggle"/>'))
        .append($('<td  ></td>')
        .append($(' <img src="images/filemanager/'+type[1]+'.png" width="30" height="30" alt="'+type[1]+'"> ')) )
        .append($('<td></td>').text(key.name))
        .append($('<td></td>').text(FileConvertSize(parseInt(key.size))));
        $("#sig-key-list").html(data.context);
        $("#sig-key-scroll").prop("class","p-2");



      });
    },
  });



  //**********set dropZone***********//
  $('#sig-imgupload').fileupload({
    dropZone: $('#sig-img-dropzone')
  });
  //*********upload image***************//
  $("#sig-imgupload").fileupload({
    add: function(e, data) {
      data.files.forEach((file, i) => {

        type=file.name.split('.');
        if(type[1]!='png' && type[1]!='jpeg'){
          alert('error:file type '+type[1]+' not accepted!')
          throw 'error:file type '+type[1]+' not accepted!';
        }

        (async () => {
          image=await asyncReadFile([file]);
        })()
        // display picture
        data.context = $('<tr ></tr>')
        .append($('<td></td>').append('<input type="checkbox" id="checkbox" name="sig-img-check" class="toggle"/>'))
        .append($('<td  ></td>')
        .append($(' <img src="images/filemanager/picture.png" width="30" height="30" alt="'+type[1]+'"> ')) )
        .append($('<td></td>').text(file.name))
        .append($('<td></td>').text(FileConvertSize(parseInt(file.size))));
        $("#sig-img-list").html(data.context);
        $("#sig-img-scroll").prop("class","p-2");



      });
    },
  });

  //********select all files**********//
  $("button[name='sig-file-select-all']").click(function(){

    $("input[name='sig-file-check']")
    .each(function(index) {
      $( this ).prop( "checked", true );
    });

  });

  //*********remove  docs from list*************//
  $("button[name='sig-file-delete-selected']").click(function(){
    var inputs=  $("tr").find("input[name=sig-file-check]");
    var i=0;
    if(files.length!=0)
    inputs.each(function( index ) {
      //if selected
      if($(this).prop("checked")== true){
        files.splice(index,1);
        $(this).parent().parent().remove();
        i--;
      }
      i++;
    });
    if(files.length==0){
      $("#sig-file-scroll").prop("class","scroll d-none");
    }

  });


  //****remove  sig key**********/
  $("button[name='sig-key-delete']").click(function(){
    var inputs=  $("tr").find("input[name=sig-key-check]");
    inputs.each(function( index ) {
      if($(this).prop("checked")== true){
        key=null;
        $(this).parent().parent().remove();
        $("#sig-key-scroll").prop("class","scroll d-none");
      }

    });


  });

  //****remove  sig key**********/
  $("button[name='sig-img-delete']").click(function(){
    var inputs=  $("tr").find("input[name=sig-img-check]");
    inputs.each(function( index ) {
      if($(this).prop("checked")== true){
        key=null;
        $(this).parent().parent().remove();
        $("#sig-img-scroll").prop("class","scroll d-none");
      }

    });
  });


  /****insert image*****/
  $("button[name='insert']").click(function(){
    if(  files!=null){
      var image_zone=$("div[name='sig-img']");
      image_zone.prop("class"," container p-3 ");
    }
  });

  /****draw rectangle*****/
  $("button[name='draw']").click(function(){
    console.log(image);
    if(  image!=null){
      $("div[name='sig-img']").prop("class"," container p-3 d-none ");
      console.log(image);
    }
  });

  /****signer les docs*****/
  $("button[name='signer']").click(function(){
    //lire la clé
    readFile(key).then(function( data ) {
      //create json object key
      obj=jQuery.parseJSON(data );
      //import key
      importPrivateKey(obj).then(function( privateKey ) {

        var promises=[];
        // pour chaque fichier pdf
        files.forEach((file, i) => {
          //read file as Binary String
          promises.push(asyncReadFile(file));
        });
        //waiting for read
        Promise.all(promises).then(  function(arrayOfData) {

          pdf_files=[];
          arrayOfData.forEach((data, i) => {
            pdf_files.push(data);
          });
          // foreach data
          pdf_files.forEach((pdf, i) => {

            (async () => {
            // load PDFDocument
            const pdfDoc = await PDFDocument.load(pdf[0]);


           if(pdf[1][1].insert==true){

           const pngImageBytes = image[0];
             // Embed  image bytes
           const pngImage = await pdfDoc.embedPng(pngImageBytes)

             // Get the width/height of the PNG image scaled down to 50% of its original size
             const pngDims = pngImage.scale(0.5)

              const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
             // get page
             const page = pdfDoc.getPage(pdf[1][1].page-1)
             console.log(pdf[1][1]);
             let date=moment();

             // add date
             page.drawText(' Signé le '+date.format('DD-MM-YYYY') +' à '+date.format('HH:mm'), {
              x: pdf[1][1].x -10,
              y: page.getHeight()- pdf[1][1].y,
              size: 10,
              font: helveticaFont,
              color: rgb(0.1, 0.1, 0.1),
            })
             // Draw the  image
             page.drawImage(pngImage, {
               x: pdf[1][1].x,
               y: page.getHeight()- pdf[1][1].y-pngDims.height,
               width: pdf[1][1].width,
               height: pdf[1][1].height,
             })
             // draw rectangle
            page.drawRectangle({
              x: pdf[1][1].x,
              y: page.getHeight()- pdf[1][1].y-pngDims.height,
              width: pdf[1][1].width,
              height: pdf[1][1].height,
               borderColor: rgb(1, 0, 0),
               borderWidth: 2,
             })


           }
              const pdfBytes = await pdfDoc.save();
              //encodage
              let enc = new TextEncoder();
              let encoded =enc.encode(await getPdfContent(pdfBytes));

              //signer
              let signature =  window.crypto.subtle.sign(
                {
                  name: "ECDSA",
                  hash: {name: "SHA-384"},
                },
                privateKey,
                encoded
              );
              signature.then(function( sign ) {
                let buffer = convertArrayBufferToHexa(sign);
                let author={"firstName":obj.nom, "lastName":obj.prenom,"email":obj.email};
                // Modifier l'entete et sauvgarder le nouveau pdf
                setDocumentMetadata(pdfBytes,buffer,author,pdf[1][0].name);

              });


            })()




          });
        });


      });



    });
  });
});
