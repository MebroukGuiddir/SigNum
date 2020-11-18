var crypto = window.crypto ;
var exported_private=null;
var exported_public=null;
async function exportCryptoKey(key,nom,prenom ,email) {
   exported_private = await window.crypto.subtle.exportKey(
    "jwk",
    key.privateKey,
  );

   exported_public = await window.crypto.subtle.exportKey(
    "jwk",
    key.publicKey
  );
  exported_private.nom=nom;
  exported_private.prenom=prenom;
  exported_private.email=email;
  exported_private.date=new Date(Date.now());

  exported_public.nom=nom;
  exported_public.prenom=prenom;
  exported_public.email=email;
  exported_public.date=new Date(Date.now());
  // convert  json object to string
  let  privateKey = JSON.stringify(exported_private, null, " ");

  let   publicKey = JSON.stringify(exported_public, null, " ");
  /*save  private key */
  var textFile = new Blob([privateKey], {
    type: 'text/plain'
  });
  invokeSaveAsDialog(textFile, "key.sig");


  // save public key
  textFile = new Blob([publicKey], {
    type: 'text/plain'
  });
  invokeSaveAsDialog(textFile, "key.verif");

}



/*generate new key pair
*/
$(document).ready(function(){
  $("button[name='generate-key']").click(function(){

    var nom=$("#nom").val();
    var prenom=$("#prenom").val();
    var email=$("#email").val();

    if (!ValidateName(nom) ){
      $("#nom").closest('.form-group').children('span').text("*Veuillez saisir un nom valide.");
      throw 'formulaire invalide';

    }
    else $("#nom").closest('.form-group').children('span').text("");
    if (!ValidateName(prenom)){
      $("#prenom").closest('.form-group').children('span').text("*Veuillez saisir un  prénom valide.");
      throw 'formulaire invalide';

    }
    else $("#prenom").closest('.form-group').children('span').text("");
    if (!ValidateEmail(email)){
      $("#email").closest('.form-group').children('span').text("*Veuillez saisir une adresse e-mail valide.");
      throw 'formulaire invalide';

    }
    else $("#email").closest('.form-group').children('span').text("");


    let keyPair = crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384"
      },
      true,
      ["sign", "verify"]
    ).then((keyPair) => {
      nom=nom[0].toUpperCase() +  nom.slice(1);
      prenom=prenom[0].toUpperCase() +  prenom.slice(1);
      exportCryptoKey(keyPair,nom,prenom,email);
      //activer le bouton export
      $("button[name='export-key']").prop("class","btn btn-info");
      $("button[name='export-key']").prop("disabled",false);
      let element=$("body");
      let alert='<div class="alert alert-success w-25  alert-dismissible fade show fixed-top-right m-3"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Success:</strong></br>paire de clés générée avec succès .</div>';
      element.append(alert);
    });

  });


    $("button[name='export-key']").click(function(){

     $.ajax({
         url : 'export.php',
         type : 'POST', // Le type de la requête HTTP, ici devenu POST
         contentType: 'application/json',
         dataType: 'json',
         data : JSON.stringify(exported_public, null, " ") , // On fait passer nos variables
         success: function(data){
           console.log(data);
                  alert("Exported!");
                  },
        error: function(response){
          console.log(response);
                  }
      });
    });
});
