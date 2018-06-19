// TD RA Javascript
var harFile = '';
var selPageID = 'page_1_0_1';
var displaySection = 'summary';

// button options
$( "#sbm" ).click(function() {
    // clear results divs
    clearDivs(true,true);
//alert( "Handler for .click() called." );
    var wptlink = $('#wptlink').val();
    var test = getWPTResultsID(wptlink);
//console.log ("server", test.serverpath);
//console.log ("testid", test.testid);
    harFile = getWPTResultsHarFile(test.serverpath, test.testid);
});

$( "#optSummary" ).click(function() {
    // clear results divs
    clearDivs(false,true);
    displaySection = "summary";
    parseHarFileSummary(harFile);
});    
$( "#optObjects" ).click(function() {
    // clear results divs
    clearDivs(false,true);
    displaySection = "objects";
    parseHarFileObjects(harFile);
});
$( "#optHeaders" ).click(function() {
    // clear results divs
    clearDivs(false,true);
    displaySection = "headers";
    parseHarFileHeaders(harFile);
});
$( "#optImages" ).click(function() {
    // clear results divs
    clearDivs(false,true);
    displaySection = "images";
    parseHarFileImages(harFile);
});
$( "#selPages" ).change(function() {
    //alert( "Handler for .change() called." );
    //var end = this.value;
    clearDivs(false,true);
    selPageID = $('#selPages').val();
console.log("selected page id: ", selPageID);
    switch (displaySection)
    {
        case "summary":
            parseHarFilePageSummary(harFile)
            break;
        case "objects":
            parseHarFileObjects(harFile)
            break;
        case "headers":
            parseHarFileHeaders(harFile)
            break;
        case "images":
            parseHarFileImages(harFile)
            break;
        }
  });

function clearDivs(s,d)
{
    if(s== true)
    {
        $("#summary").empty();
        $("#selPages").empty();
    }
        if(d== true)
        $("#detail").empty();
}
//////////////////////////////////////////////////////////////
function getWPTResultsID(wptlink)
{
console.log ("getting results ID for " + wptlink);
    var respos = wptlink.indexOf("results.php");
    if(respos != -1)
    {
        // get server path
        var serverpath = wptlink.substring(0,respos-1);
        // get testid
        var testpos = wptlink.indexOf("test=");
        var testid = wptlink.substring(testpos + 5);
    }
    else
    {
        respos = wptlink.indexOf("result");
        // get server path
        var serverpath = wptlink.substring(0,respos-1);
        // get testid
        var testid = wptlink.substring(respos + 7);
        testid = testid.substring(0,testid.length-1);
    }
// function debug
// console.log ("server", serverpath);
// console.log ("testid", testid);
    return {serverpath: serverpath, testid: testid};
}

function getWPTResultsHarFile(server,id)
{
    var pathHarFile = server + "/export.php?bodies=1&pretty=1&test=" + id;
    // Assign handlers immediately after making the request,
    // and remember the jqxhr object for this request
    var jqxhr = $.get( pathHarFile, function() {
        console.log(pathHarFile)
    //  alert( "sent success" );
    })
        .done(function(dataHarFile) {
        // alert( "get success" );
        // console.log(dataHarFile);
        harFile = dataHarFile;
        parseHarFileTestResults(harFile);
        })
        .fail(function() {
            alert( "error" );
        })
        .always(function() {
        //  alert( "finished" );
        });
    
    // Perform other work here ...

    // Set another completion function for the request above
    jqxhr.always(function() {
    //  alert( "second finished" );
  });
  return harFile;
}

function parseHarFileTestResults(harFile)
{
    var noofPages = 0;
    var noofSteps = 0;
    var noofRuns = 0;
    // prepare divs
    $("#summary").append('<div id="test"></div>');
    
//console.log(harFile);
    $.each(harFile, function(key,obj) {
//console.log(key,obj);
        console.log(obj.version,obj.browser.name,obj.browser.version);
        $("#test").append("Browser: " + obj.browser.name + " " + obj.browser.version + "<br/>");
        $.each(obj.pages, function(keyPages,page) {
//console.log(keyPages,page);
            noofPages++;
            if(page._run > noofRuns)
                noofRuns = page._run;
                if(page._step > noofSteps)
                noofSteps = page._step;
            // append page ids to dropdown
            $("#selPages").append($('<option></option>').val(page.id).html(page._URL));
        }); // end pages
        $("#test").append('Number of Pages Tested: ' + noofPages + "<br/>");
        $("#test").append('Number of Steps: ' + noofSteps + "<br/>");
        $("#test").append('Number of Runs: ' + noofRuns + "<br/>");

    }); // end log
    parseHarFileSummary(harFile);
}

function parseHarFileSummary(harFile)
{
console.log("summary called for page",selPageID);
    // prepare divs
    $("summary").append('<div id="pagesummary"></div>');
    
console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,page) {
            if (page.id == selPageID)
            {
                console.log("page matched", page.id);
                // extract page summary information
                console.log(page);

                // get page stats


            }
            else
            {
//console.log("page not matched", page.id);
            }
        }); // end pages

        // get entry stats
        $.each(obj.entries, function(keyEntries,entries) {
           // console.log(keyEntries,entries);
            var contentTye = entries._contentType;

           // console.log("summary",entries.startedDateTime,entries._full_url);



        }); // end entries

    }); // end log
}

function parseHarFileObjects(harFile)
{
    // prepare divs
    $("#detail").append('<div id="objects"></div>');

    // add table
    var table = document.createElement("table");
    table.setAttribute("id", "tableObjects");
    table.setAttribute("class","cell-border compact stripe");

    //Add a header
    var header = document.createElement("thead");
    var headerrow = document.createElement("tr");
    
    var idHeaderCell = document.createElement("th");
    var hostHeaderCell = document.createElement("th");
    var nameHeaderCell = document.createElement("th");
    var mimetypeHeaderCell = document.createElement("th");
    var datetimeHeaderCell = document.createElement("th");
    var protocolHeaderCell = document.createElement("th");
    var responsecodeHeaderCell = document.createElement("th");
    var contentencodingHeaderCell = document.createElement("th");
    var objectSizeHeaderCell = document.createElement("th");
    
    
    // column headers
    idHeaderCell.appendChild(document.createTextNode("#"));
    hostHeaderCell.appendChild(document.createTextNode("Host"));
    nameHeaderCell.appendChild(document.createTextNode("URL"));
    mimetypeHeaderCell.appendChild(document.createTextNode("Content Type"));
    datetimeHeaderCell.appendChild(document.createTextNode("Date Time"));
    protocolHeaderCell.appendChild(document.createTextNode("Protocol"));
    responsecodeHeaderCell.appendChild(document.createTextNode("Response Code"));
    contentencodingHeaderCell.appendChild(document.createTextNode("Content Encoding"));
    objectSizeHeaderCell.appendChild(document.createTextNode("Size (bytes)"));

    headerrow.appendChild(idHeaderCell);
    headerrow.appendChild(hostHeaderCell);
    headerrow.appendChild(nameHeaderCell);
    headerrow.appendChild(mimetypeHeaderCell);
    headerrow.appendChild(datetimeHeaderCell);
    headerrow.appendChild(protocolHeaderCell);
    headerrow.appendChild(responsecodeHeaderCell);
    headerrow.appendChild(contentencodingHeaderCell);
    headerrow.appendChild(objectSizeHeaderCell);

    // append header to table
    header.appendChild(headerrow);
    table.appendChild(header);

    var body = document.createElement("tbody");


    //  console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,page) {
            if (page.id == selPageID)
            {
                console.log("page matched", page.id);
                // extract page summary information
                console.log(page); 
            }
        }); // end pages

        $.each(obj.entries, function(keyEntries,entry) {
            if (entry.pageref == selPageID)
            {
                console.log(keyEntries,entry);

                var tr = document.createElement("tr");

                var idCell = document.createElement("td");
                var hostCell = document.createElement("td");
                var nameCell = document.createElement("td");
                var nameSpan = document.createElement("div");
                nameSpan.setAttribute("class", "wrap");
                var mimetypeCell = document.createElement("td");
                var datetimeCell = document.createElement("td");
                var protocolCell = document.createElement("td");
                var responsecodeCell = document.createElement("td");
                var contentencodingCell = document.createElement("td");
                var objectSizeCell = document.createElement("td");
            
                idCell.appendChild(document.createTextNode(entry._index));
                hostCell.appendChild(document.createTextNode(entry._host));
                nameSpan.appendChild(document.createTextNode(entry._url));
                mimetypeCell.appendChild(document.createTextNode(entry._contentType));
                datetimeCell.appendChild(document.createTextNode(entry.startedDateTime));
                protocolCell.appendChild(document.createTextNode(entry._protocol));
                responsecodeCell.appendChild(document.createTextNode(entry._responseCode));
                contentencodingCell.appendChild(document.createTextNode(entry._contentEncoding));
                nameCell.appendChild(nameSpan);
                objectSizeCell.appendChild(document.createTextNode(entry._objectSize.toLocaleString('en-GB')));

                tr.appendChild(idCell);
                tr.appendChild(hostCell);
                tr.appendChild(nameCell);
                tr.appendChild(mimetypeCell);
                tr.appendChild(datetimeCell);
                tr.appendChild(protocolCell);
                tr.appendChild(responsecodeCell);
                tr.appendChild(contentencodingCell);
                tr.appendChild(objectSizeCell);
            
                body.appendChild(tr)

            }
            // console.log("headers",entry.startedDateTime,entry._full_url);



        }); // end entries

    }); // end log
    table.appendChild(body);
    $("#objects").append(table);
    $('#tableObjects').DataTable();
}

function parseHarFileHeaders(harFile)
{
    // prepare divs
    $("#detail").append('<div id="headers"></div>');

    // add table
    var table = document.createElement("table");
    table.setAttribute("id", "tableHeaders");
    table.setAttribute("class","cell-border compact stripe");

    //Add a header
    var header = document.createElement("thead");
    var headerrow = document.createElement("tr");
    
    var idHeaderCell = document.createElement("th");
    var nameHeaderCell = document.createElement("th");
    var mimetypeHeaderCell = document.createElement("th");
    
    // column headers
    idHeaderCell.appendChild(document.createTextNode("#"));
    nameHeaderCell.appendChild(document.createTextNode("URL"));
    mimetypeHeaderCell.appendChild(document.createTextNode("Content Type"));

    headerrow.appendChild(idHeaderCell);
    headerrow.appendChild(nameHeaderCell);
    headerrow.appendChild(mimetypeHeaderCell);

    // append header to table
    header.appendChild(headerrow);
    table.appendChild(header);

    var body = document.createElement("tbody");


    //  console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,page) {
            if (page.id == selPageID)
            {
//console.log("page matched", page.id);
                // extract page summary information
//console.log(page); 
            }
        }); // end pages

        $.each(obj.entries, function(keyEntries,entry) {
            if (entry.pageref == selPageID)
            {
                console.log(keyEntries,entry);

                var tr = document.createElement("tr");

                var idCell = document.createElement("td");
                var nameCell = document.createElement("td");
                var mimetypeCell = document.createElement("td");
            
                idCell.appendChild(document.createTextNode(entry._index));
                var nameCell = document.createElement("td");
                var nameSpan = document.createElement("div");
                nameSpan.setAttribute("class", "wrap");
                nameSpan.appendChild(document.createTextNode(entry._url));
                mimetypeCell.appendChild(document.createTextNode(entry._contentType));
                nameCell.appendChild(nameSpan);

                tr.appendChild(idCell);
                tr.appendChild(nameCell);
                tr.appendChild(mimetypeCell);
            
                body.appendChild(tr)

            }
            // console.log("headers",entry.startedDateTime,entry._full_url);



        }); // end entries

    }); // end log
    table.appendChild(body);
    $("#headers").append(table);
    $('#tableHeaders').DataTable();
}


function parseHarFileImages(harFile)
{
    // prepare divs
    $("#detail").append('<div id="images"></div>');

    // add table
    var table = document.createElement("table");
    table.setAttribute("id", "tableImages");
    table.setAttribute("class","cell-border compact stripe");

    //Add a header
    var header = document.createElement("thead");
    var headerrow = document.createElement("tr");
    
    var urlHeaderCellHidden = document.createElement("th");
    var idHeaderCell = document.createElement("th");
    var nameHeaderCell = document.createElement("th");
    var mimetypeHeaderCell = document.createElement("th");
    var objectSizeHeaderCell = document.createElement("th");
    
    // column headers
    urlHeaderCellHidden.appendChild(document.createTextNode("Full URL"));
    idHeaderCell.appendChild(document.createTextNode("#"));
    nameHeaderCell.appendChild(document.createTextNode("URL"));
    mimetypeHeaderCell.appendChild(document.createTextNode("Content Type"));
    objectSizeHeaderCell.appendChild(document.createTextNode("Size (bytes)"));

    headerrow.appendChild(urlHeaderCellHidden);
    headerrow.appendChild(idHeaderCell);
    headerrow.appendChild(nameHeaderCell);
    headerrow.appendChild(mimetypeHeaderCell);
    headerrow.appendChild(objectSizeHeaderCell);

    // append header to table
    header.appendChild(headerrow);
    table.appendChild(header);

    var body = document.createElement("tbody");


    //  console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,page) {
            if (page.id == selPageID)
            {
//console.log("page matched", page.id);
                // extract page summary information
//console.log(page); 
            }
        }); // end pages

        var arrayImageContentTypes = ["image/jpeg","image/gif", "image/webp", "image/bmp", "image/x-icon"];

        $.each(obj.entries, function(keyEntries,entry) {
            if (entry.pageref == selPageID && arrayImageContentTypes.indexOf(entry._contentType) != -1)
            {
                console.log(keyEntries,entry);

                var tr = document.createElement("tr");

                var urlCell = document.createElement("td");
                var idCell = document.createElement("td");
                var nameCell = document.createElement("td");
                var mimetypeCell = document.createElement("td");
                var objectSizeCell = document.createElement("td");
                
                urlCell.appendChild(document.createTextNode(entry._full_url));
                idCell.appendChild(document.createTextNode(entry._index));
                var nameCell = document.createElement("td");
                var nameSpan = document.createElement("div");
                nameSpan.setAttribute("class", "wrap");
                nameSpan.appendChild(document.createTextNode(entry._url));
                nameCell.appendChild(nameSpan);
                mimetypeCell.appendChild(document.createTextNode(entry._contentType));
                objectSizeCell.appendChild(document.createTextNode(entry._objectSize.toLocaleString('en-GB')));
                
                // keep URL first to hide it in table view
                tr.appendChild(urlCell);
                tr.appendChild(idCell);
                tr.appendChild(nameCell);
                tr.appendChild(mimetypeCell);
                tr.appendChild(objectSizeCell);
            
                body.appendChild(tr)

            }
            // console.log("headers",entry.startedDateTime,entry._full_url);

        }); // end entries

    }); // end log
    table.appendChild(body);
    $("#images").append(table);
    $('#tableImages').DataTable( {
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 1,2,3,4 ],
                "visible": true,
                "searchable": true
            }
        ],
        "order": [4, "desc"] // sort by byte size descending
    } );

    // add view images buttons
    var buttonView = document.createElement("button");
    var buttonViewNone = document.createElement("button");
    buttonView.value = "View";
    buttonView.setAttribute("id", "viewimages");
    buttonView.appendChild(document.createTextNode("View"));
    buttonViewNone.value = "Hide";
    buttonViewNone.setAttribute("id", "unviewimages");
    buttonViewNone.appendChild(document.createTextNode("Hide"));
    $("#images").append('<div id="viewbuttons"></div>');
    $("#viewbuttons").append(buttonView);
    $("#viewbuttons").append(buttonViewNone);
    $("#images").append('<div id="imagesview"></div>');
    buttonView.onclick = function() {
        // Note this is a function
        viewImagesinTable();
    };
    buttonViewNone.onclick = function() {
        $('#imagesview').empty();
    };
}

function getFileName(url) {
    //this removes the anchor at the end, if there is one
    url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
    //this removes the query after the file name, if there is one
    url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
    //this removes everything before the last slash in the path
    url = url.substring(url.lastIndexOf("/") + 1, url.length);
    //return
    return url;
    }

function viewImagesinTable()
{
    var table = $('#tableImages').DataTable();
    $('#imagesview').empty(); 
    
    table.rows({order:'index', search:'applied'}).every( function () {
        var d = this.data();
    
//console.log(d[0],d[4],parseInt(d[4].replace(/,/g, '')));
    var filename = getFileName(d[0]);
    var filesize = d[4];

    if(parseInt(filesize.replace(/,/g, '')) > 43)
    {
        var imagetoview = document.createElement("figure");
        imagetoview.setAttribute("id", "image_" + d[1]);
        $('#imagesview').append($(imagetoview));
        $('#image_'+ d[1]).append($('<img>',{id:'theImg_'+ d[1],src:d[0],class: 'displayedimage'}));
        $('#image_'+ d[1]).append($('<figcaption>' + filename + ' (' + filesize.toLocaleString('en-GB') + ' bytes)' + '</figcaption>'));
        //$('#imagesview').append($(imagetoview));
        
    }
    })
        // toggle background to figures
        $(".displayedimage").click(function () {
            $(this).toggleClass("green");
         });


}