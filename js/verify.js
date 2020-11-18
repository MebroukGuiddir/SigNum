
var key_verif=null;
var arr=null;
$(document).ready(function(){

  //****set verify-fileupload drop zone *******//
  $('#verify-fileupload').fileupload({
    dropZone: $('#verify-file-dropzone')
  });
  //************* upload a new pdf doc ********//
  $("#verify-fileupload").fileupload({
    add: function(e, data) {

      data.files.forEach((file, i) => {
        type=file.name.split('.');
        //only pdf files are accepted
        if(type[1]!='pdf'){
          alert('error:file type '+type[1]+' not accepted!')
          throw 'error:file type '+type[1]+' not accepted!';
        }

        //***afficher dans la table ****//
        data.context = $('<tr ></tr>')
        .append($('<td></td>').append('<input type="checkbox" id="checkbox" name="verify-file-check" class="toggle"/>'))
        .append($('<td  ></td>')
        .append($(' <img src="images/filemanager/'+type[1]+'.png" width="30" height="30" alt="'+type[1]+'"> ')) )
        .append($('<td></td>').text(file.name))
        .append($('<td></td>').text(FileConvertSize(parseInt(file.size))))
        .append($('<td>-</td>'))
        .append($('<td>-</td>'))
        .append($('<td><div class="loader"></div> </td>'))
        .appendTo($("#verify-file-list"));
        $("#verify-file-scroll").prop("class","scroll");

        //***vérification de la signature****//

          promise=readFile(file);
          promise.then(function(pdfData){
            (async () => {
              //encode file content
              let enc = new TextEncoder();
              const encoded =enc.encode(await getPdfContent(pdfData));
              // get pdf key words metadata
              const pdfKeywords = await getPdfKeywordsContent(pdfData);
              let keywords=pdfKeywords.split("#");
              //convert signature to buffer array
              let signature=hexStringToArrayBuffer(keywords[0]);
              // set author
              let  author=JSON.parse(keywords[1]);
              // set signature date
              let date=keywords[2];
              // verify signature
              verifyMessage(key_verif,signature,encoded)
              .then(function( result ){
                if (result){
                  //if success
                  data.context.children().eq(4).html(date);;
                  data.context.children().eq(5).html("<b>"+author.firstName+" "+author.lastName+"</br>"+author.email+"</b>");
                  data.context.children().eq(6).html(' <img src="images/filemanager/verify.webp" width="30" height="30" alt="Success"> ');
                }
                else{
                  data.context.children().eq(6).html(' <img src="images/filemanager/error.webp" width="30" height="30" alt="Failed"> ');
                }

              });
            })()
          });
        });

    },
  });



  //set dropZone
  $('#verify-keyupload').fileupload({
    dropZone: $('#verify-key-dropzone')
  });
  //upload key
  $("#verify-keyupload").fileupload({
    add: function(e, data) {
      data.files.forEach((file, i) => {

        type=file.name.split('.');
        if(type[1]!='verif'){
          alert('error:file type '+type[1]+' not accepted!')
          throw 'error:file type '+type[1]+' not accepted!';
        }

        // load keyVerif
        readFile(file).then(function( data ) {
          key_verif=jQuery.parseJSON(data );
          context = $('<tr ></tr>')
          .append($('<td></td>').append('<input type="checkbox" id="checkbox" name="verify-key-check" class="toggle"/>'))
          .append($('<td  ></td>')
          .append($(' <img src="images/filemanager/'+type[1]+'.png" width="30" height="30" alt="'+type[1]+'"> ')) )
          .append($('<td></td>').text(key_verif.nom))
          .append($('<td></td>').text(key_verif.prenom))
          .append($('<td></td>').text(key_verif.email))
          .append($('<td></td>').text("disk"));
          $("#verify-key-list").html(context);
          $("#verify-key-scroll").prop("class","");
            importPublicKey(key_verif).then(function( publicKey ) {
              key_verif=publicKey;
              console.log(key_verif);
            });
          //activate file's dropzone
          var div=$("div[name='pdf-verify']");
          div.prop("class","p-2");
        });
      });
    },
  });

  //select all pdf files
  $("button[name='verify-file-select-all']").click(function(){

    $("input[name='verify-file-check']")
    .each(function(index) {
      console.log("test");
      $( this ).prop( "checked", true );

    });

  });




  //**********remove  docs from list **************//
  $("button[name='verify-file-delete-selected']").click(function(){
    var inputs=  $("tr").find("input[name=verify-file-check]");
    // foreach tr
    inputs.each(function( index ) {
      //remove tr element
      if($(this).prop("checked")== true){
        //if selected
        $(this).parent().parent().remove();
      }
    });
    //hide table if it's empty
    var inputs=  $("tr").find("input[name=verify-file-check]");
    if(inputs.length==0)
    $("#verify-file-scroll").prop("class","p-2  d-none");
  });




  //************remove  verify key**************//
  $("button[name='verify-key-delete']").click(function(){
    var inputs=  $("tr").find("input[name=verify-key-check]");
    inputs.each(function( index ) {
      //if key selected
      if($(this).prop("checked")== true){
        //remove key
        key_verif=null;
        $(this).parent().parent().remove();
        //hide file dropzone
        $("div [name=pdf-verify]").prop("class","p-2 d-none");
        //hide key table
        $("#verify-key-scroll").prop("class","p-2 d-none");
        // remove all files
        var inputs=  $("tr").find("input[name=verify-file-check]");
        inputs.each(function( index ) {
          $(this).parent().parent().remove();
        });
        //hide files table
        $("#verify-file-scroll").prop("class","p-2  d-none");
      }

    });
  });


 ///*** toggle listener // switch upload mode ***//
 $(function() {
    $('#change-mode').change(function() {
      if($(this).prop('checked')){
        $('#upload-disk').prop("class","d-none");
        $('#upload-server').prop("class","container");
      }
      else{
        $('#upload-server').prop("class","d-none");
        $('#upload-disk').prop("class","container");
      }

    })
  })

 /** select verify key ***/

  $('#verify-key-table').on( 'click', 'tr', function (e) {
        var row_num = e.currentTarget.rowIndex;
        $(this).addClass('table-active').siblings().removeClass('table-active');

        element=$('<tr ></tr>')
        .append($('<td></td>').append('<input type="checkbox" id="checkbox" name="verify-key-check" class="toggle"/>'))

        .append($('<td  ></td>')
        .append($(' <img src="images/filemanager/verif.png" width="30" height="30" alt="verif"> ')) )
        .append($('<td></td>').text(arr[row_num].nom))
        .append($('<td></td>').text(arr[row_num].prenom))
        .append($('<td></td>').text(arr[row_num].email))
        .append($('<td></td>').text("server"))
        ;
        $("#verify-key-list").html(element);
        $("#verify-key-scroll").prop("class","");
        key_verif=JSON.parse(arr[row_num].cle,null,"");
        importPublicKey(key_verif).then(function( publicKey ) {
          key_verif=publicKey;
          console.log(key_verif);
        });


        //activate file's dropzone
        var div=$("div[name='pdf-verify']");
        div.prop("class","p-2");

      } );


///*** import verif key from server *****//
$("button[name='search']").click(function(){
  val=$("#search-input").val().split(' ');
  if(!val[0])nom="";
  else nom=val[0];
  if(!val[0])prenom="";
  else prenom=val[0];
  if (!val) { return false;}
  console.log("gdsdfg");
  $.ajax(
 {
     // Post select to url.
     type : 'post',
     url : 'import.php',
     dataType : 'json', // expected returned data format.
     contentType: 'application/json',
     data :JSON.stringify({
             'nom' : nom ,
             'prenom' :prenom
           }) ,

     success : function(response)
     {arr=response.data;
         $("#verify-key-table").html("");
       for (i = 0; i < arr.length; i++) {
         list = $('<tr ></tr>')
         .append($('<td></td>').text(arr[i].nom))
         .append($('<td></td>').text(arr[i].prenom))
         .append($('<td></td>').text(arr[i].email))
         .append($('<td></td>').text(arr[i].date));
         $("#verify-key-table").append(list);
         console.log(arr[i]);
       }

     },
     error: function(response){
       console.log(response);
     }
   });
 });

});
