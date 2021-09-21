
function export2Word( element, name) {

   var html, link, blob, url, css;

   css = (
     '<style>' +
     '@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}' +
     'div.WordSection1 {page: WordSection1;}' + 
'body {padding: 15px;font: 14px Times New Roman, "Lucida Grande", Helvetica, Arial, sans-serif;background-color: rgb(255, 255, 255);}' +
  'table { width: 100%;  border-collapse: collapse;}' +
   '.tb1, .td1 {border: 1px solid rgb(186, 188, 194); padding: 5px;}'+  
    '.indent{text-align: justify; text-justify: inter-word;  text-indent: 50px;   font-size: 15px;} '+
    'p{font-size: 15px;}'+
    '#inner {  display: table; margin: 0 auto;  max-width:1200px;} '+
    '#outer { border: 1px solid red;  width:100%} '+
     '</style>'
   );

   html = element.innerHTML;
   blob = new Blob(['\ufeff', css + html], {
     type: 'application/msword'
   });
   url = URL.createObjectURL(blob);
   link = document.createElement('A');
   link.href = url;
   link.download = name;  // default name without extension 
   document.body.appendChild(link);
   if (navigator.msSaveOrOpenBlob ) navigator.msSaveOrOpenBlob( blob, name+'.doc'); // IE10-11
       else link.click();  // other browsers
   document.body.removeChild(link);
 };
