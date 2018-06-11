// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

var gCtx = null;
var gCanvas = null;
var c=0;
var stype=0;
var gUM=false;
var webkit=false;
var moz=false;
var v=null;


function handleFiles(f)
{
	var o=[];
	
	for(var i =0;i<f.length;i++)
	{
        var reader = new FileReader();
        reader.onload = (function(theFile) {
        return function(e) {
            
            var img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                var imagedata = ctx.getImageData(0, 0, img.width, img.height);
              
                const code = jsQR(imagedata.data, img.width, img.height);
                if (code) {
                    console.log(code)
                    read(code.data);
                }
                {
                    read("Something has gone terribly wrong!");
                }
                
            }
            //qrcode.decode(e.target.result);
        };
        })(f[i]);
        reader.readAsDataURL(f[i]);	
    }
}

function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        try{
            gCtx.drawImage(v,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                //console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                //console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(a)
{
    
    var stringQR = a.toString();
    var html="<br>";
    
    if (stringQR.includes("stinkpoints.com")) {
        window.top.location.href = "http://" + a;
        document.getElementById("result").innerHTML="";
        return
    }
    else {
        $("#imagepicker").val(''); 
        html+="Something Went Wrong!<br>Try Again!<br><br>"+ "Error Message:<br>" + '"'+a+'"';
         document.getElementById("result").innerHTML=html;        
        return;
    }
    

    if(a.indexOf("http://") === 0 || a.indexOf("https://") === 0)

    
    
        html+="<a target='_blank' href='"+a+"'>"+a+"</a><br>";
    //html+="<b>"+htmlEntities(a)+"</b><br><br>";
    document.getElementById("result").innerHTML=html;
}	

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}
function success(stream) 
{

    v.srcObject = stream;
    v.play();

    gUM=true;
    setTimeout(captureToCanvas, 500);
}
		
function error(error)
{
    gUM=false;
    return;
}

function load()
{
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		//qrcode.callback = read;
		document.getElementById("mainbody").style.display="inline";
	}
	else
	{
		document.getElementById("mainbody").style.display="inline";
		document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
	}
}


function setimg()
{
	document.getElementById("result").innerHTML="";
    if(stype==2)
        return;
    //document.getElementById("qrimg").src="qrimg.png";
    //document.getElementById("webcamimg").src="webcam2.png";
    var qrfile = document.getElementById("qrfile");
    stype=2;
}
