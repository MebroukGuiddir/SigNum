// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.js';
var fileReader = new FileReader();
    //document
var pdfDoc = null,
    // numéro d la page
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    //zone d'affichage
    canvas = document.getElementById('canvas'),
    // le context de canvas
    ctx = canvas.getContext('2d'),
     typedarray=null,
     // indice du fichier actuel dans la liste files
     file_index=0;
    // init canvas
   fcanvas= new fabric.Canvas("canvas", {
        selection: false
      }),
    // nouveau rectangle
   rect = new fabric.Rect({
        left: 200,
        top: 200,
        width: 100,
        height: 100,
        fill: '#FF454F',
        opacity: 0.5,
        transparentCorners: true,
        borderColor: "red",
        cornerColor: "gray",
        hasRotatingPoint: false,
        cornerSize: 5
      }),
    bg=null
     ;
/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var scale = 1;
   var viewport = page.getViewport({scale: scale});

    canvas.height =viewport.height;
    canvas.width = viewport.width;

    ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;

      }
      //display pdf file
      bg = canvas.toDataURL("image/png");
      fcanvas.setBackgroundImage(bg,fcanvas.renderAll.bind(fcanvas));
      fcanvas.setWidth(canvas.width);
      fcanvas.setHeight(canvas.height);
       fcanvas.clear();
       fcanvas.add(rect);
       fcanvas.renderAll();
    });



  });

  // Update page counters
  document.getElementById('page_num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
  bg = canvas.toDataURL("image/png");
  fcanvas.setBackgroundImage(bg,fcanvas.renderAll.bind(fcanvas));
  fcanvas.setWidth(canvas.width);
  fcanvas.setHeight(canvas.height);
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);



//display pdf in canvas
function displayPdf(typedarray){
  pdfjsLib.getDocument(typedarray).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
}

//display pdf

$("button[name='draw']").click(function(){
  pdf_file=files[0];
  pageNum = 1;
  fileReader.readAsArrayBuffer(pdf_file[0]);
  //next stap
  stepper1.next();
});

//display next file
$("button[name='next-file']").click(function(){

  if(file_index<files.length-1){
    file_index++;
    pdf_file=files[file_index];
    pageNum = 1;
    fileReader.readAsArrayBuffer(pdf_file[0]);
  }

});
//display previous file
$("button[name='prev-file']").click(function(){

  if(file_index>0){
    file_index--;
    pdf_file=files[file_index];
    pageNum = 1;
    fileReader.readAsArrayBuffer(pdf_file[0]);
  }
});

fileReader.onload = function() {
  typedarray = new Uint8Array(this.result);
  // view pdf
  pageNum = 1,
  displayPdf(typedarray);
  $("p[name='fileName']").text(pdf_file[0].name);

};

//save file change
$("button[name='valider']").click(function(){
console.log(rect);
files[file_index][1].insert=true;
files[file_index][1].page=pageNum;
files[file_index][1].x=rect.left;
files[file_index][1].y=rect.top;
files[file_index][1].height=rect.height;
files[file_index][1].width=rect.width;
let element=$("body");
let alert='<div class="alert alert-success w-25  alert-dismissible fade show fixed-top-right m-3"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Modification enregistrée</strong></br></div>';
element.append(alert);
});

function recap(step){
  context = $('<div></div>').append($('<b></b>').text('fichiers pdf à signer:'));
  fileslist=$('<ul></ul>')
  files.forEach((pdf, i) => {
    fileslist.append($('<li></li>').text(pdf[0].name))
  });
  context.append(fileslist);
  context.append($('<b></b>').text('Clé de signature :'));
  context.append($('<ul></ul>').append($('<li></li>').text(key.name)));
  context.append($('<b></b>').text('Signature manuscrite :'));
  context.append($('<ul></ul>').append($('<li></li>').text((image!=null)?image[1][0].name:'aucune')));
console.log(image[1]);
  $("#div-recap").html(context);
  if(step==3)stepper1.next();
  stepper1.next();
}
