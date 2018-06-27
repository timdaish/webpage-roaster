// Webpage Roaster - Javascript
// Tim Daish, 2018
var harFile = '';
var selPageID = 'page_1_0_1';
var displaySection = 'summary';
var jobnumber = '';
var noofPages = 0;
var noofSteps = 0;
var noofRuns = 0;
var fvonly = true;

// button options
$( "#sbm" ).click(function() {
    // clear results divs
    $( "#summary" ).show();
    $("#selPages").empty();
    $("#test").empty();
    noofPages = 0;
    noofSteps = 0;
    noofRuns = 0;
    fvonly = true;
    clearDivs(true,true,true);
//alert( "Handler for .click() called." );
    var wptlink = $('#wptlink').val();
    // if(wptlink.slice(-1) != "/")
    //     wptlink = wptlink + "/";
    var test = getWPTResultsID(wptlink);
    jobnumber = test.testid;
//console.log ("server", test.serverpath);
//console.log ("testid", test.testid);
    harFile = getWPTResultsHarFile(test.serverpath, test.testid);
    // post details for logging
    $.ajax({
        url: "xhr_logging.php", 
        type: "POST",
        data: { sv: test.serverpath, id : test.testid }
    })
    .done(function() {
    })
    .fail(function() {
    //alert( "error logging request " + filename );
    })
    .always(function() {
    //alert( "complete" );
    });
});

$( "#optSummary" ).click(function() {
    // clear results divs
    clearDivs(true,true,true);
    displaySection = "summary";
    $( "#optSummary" ).addClass( "active" );
    $( "#optObjects" ).removeClass( "active" );
    $( "#optHeaders" ).removeClass( "active" );
    $( "#optImages" ).removeClass( "active" );
    $( "#summary" ).show();
    parseHarFileSummary(harFile);
});    
$( "#optObjects" ).click(function() {
    // clear results divs
    clearDivs(false,true,true);
    displaySection = "objects";
    $( "#optSummary" ).removeClass( "active" );
    $( "#optObjects" ).addClass( "active" );
    $( "#optHeaders" ).removeClass( "active" );
    $( "#optImages" ).removeClass( "active" );
    $( "#summary" ).hide();
    parseHarFileObjects();
});
$( "#optHeaders" ).click(function() {
    // clear results divs
    clearDivs(false,true,true);
    displaySection = "headers";
    $( "#optSummary" ).removeClass( "active" );
    $( "#optObjects" ).removeClass( "active" );
    $( "#optHeaders" ).addClass( "active" );
    $( "#optImages" ).removeClass( "active" );
    $( "#summary" ).hide();
    parseHarFileHeaders();
});
$( "#optImages" ).click(function() {
    // clear results divs
    clearDivs(false,true,true);
    displaySection = "images";
    $( "#optSummary" ).removeClass( "active" );
    $( "#optObjects" ).removeClass( "active" );
    $( "#optHeaders" ).removeClass( "active" );
    $( "#optImages" ).addClass( "active" );
    $( "#summary" ).hide();
    parseHarFileImages();
});
$( "#selPages" ).change(function() {
    //alert( "Handler for .change() called." );
    //var end = this.value;
    clearDivs(false,true,true);
    selPageID = $('#selPages').val();
console.log("active page id: ", selPageID);

    switch (displaySection)
    {
        case "summary":
            $( "#optSummary" ).addClass( "active" );
            $( "#optObjects" ).removeClass( "active" );
            $( "#optHeaders" ).removeClass( "active" );
            $( "#optImages" ).removeClass( "active" );
            $( "#summary" ).show();
            parseHarFilePage(harFile);
            parseHarFileSummary(harFile);
            break;
        case "objects":
            $( "#optSummary" ).removeClass( "active" );
            $( "#optObjects" ).addClass( "active" );
            $( "#optHeaders" ).removeClass( "active" );
            $( "#optImages" ).removeClass( "active" );
            $( "#summary" ).hide();
            parseHarFilePage(harFile);
            parseHarFileObjects();
            break;
        case "headers":
            $( "#optSummary" ).removeClass( "active" );
            $( "#optObjects" ).removeClass( "active" );
            $( "#optHeaders" ).addClass( "active" );
            $( "#optImages" ).removeClass( "active" );
            $( "#summary" ).hide();
            parseHarFilePage(harFile);
            parseHarFileHeaders()
            break;
        case "images":
            $( "#optSummary" ).removeClass( "active" );
            $( "#optObjects" ).removeClass( "active" );
            $( "#optHeaders" ).removeClass( "active" );
            $( "#optImages" ).addClass( "active" );
            $( "#summary" ).hide();
            parseHarFilePage(harFile);
            parseHarFileImages()
            break;
        }
  });

function clearDivs(job,test,detail)
{
    if(job == true)
    {
        $("#summary").empty();
    }
    if(test == true)
        $("#pagesummary").empty();
    if(detail == true)
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
//console.log ("server", serverpath);
//console.log ("testid", testid);
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
    // prepare divs
    $( "#optSummary" ).addClass( "active" );
    $( "#optObjects" ).removeClass( "active" );
    $( "#optHeaders" ).removeClass( "active" );
    $( "#optImages" ).removeClass( "active" );
//console.log(harFile);
    $.each(harFile, function(key,obj) {
//console.log(key,obj);
//console.log(obj.version,obj.browser.name,obj.browser.version);
        $.each(obj.pages, function(keyPages,page) {
//console.log(keyPages,page);
            noofPages++;
            if(page._run > noofRuns)
                noofRuns = page._run;
                if(page._step > noofSteps)
                noofSteps = page._step;
            if(page._cached == 1)
                fvonly = false;
            // append page ids to dropdown
            $("#selPages").append($('<option></option>').val(page.id).html(page._URL));
        }); // end pages
        $("#test").append('<span class="testinfo">Browser: ' + obj.browser.name + " " + obj.browser.version + '</span>');
        $("#test").append('<span class="testinfo">Number of Pages Tested: ' + noofPages+ '</span>');
        $("#test").append('<span class="testinfo">Number of Steps: ' + noofSteps+ '</span>');
        $("#test").append('<span class="testinfo">Number of Runs: ' + noofRuns+ '</span>');
        if(fvonly == true)
            $("#test").append('<span class="testinfo">First View only</span>');
        else
            $("#test").append('<span class="testinfo">First and Repeat View</span>');

    }); // end log
    parseHarFilePage(harFile);
    parseHarFileSummary(harFile);
}

function parseHarFilePage(harFile)
{
//console.log("summary called for page",selPageID);
    // prepare divs
//console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,page) {
            if (page.id == selPageID)
            {
//console.log("page matched", page.id);
                // extract page summary information
//console.log(page);
            $("#pagename").text(page.title);
            }
        });
    });
}

function parseHarFileSummary(harFile)
{
//console.log("summary called for page",selPageID);
    // prepare divs
    $("#summary").append('<div id="pagesummary"></div>');
    var statsList = document.createElement("ul");
    statsList.setAttribute("id","statslist");
//console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,page) {
            if (page.id == selPageID)
            {
//console.log("page matched", page.id);
                // extract page summary information
console.log(page);
                // get page stats
                // if(noofRuns > 1)
                //     addStat(statsList,"Run No.","",page._run,"","");
                // if(noofSteps > 1)
                //     addStat(statsList,"Step No.","",page._step,"","");
                addStat(statsList,"Total Page Size","",formatBytes(page._bytesIn),"","")
                addStat(statsList,"No. of Requests","",page._requests,"","")
                addStat(statsList,"Render Start","",page.pageTimings._startRender/1000,"s","")
                addStat(statsList,"Speed Index","",page._SpeedIndex,"","")
                //addStat(statsList,"Base CDN","",page._base_page_cdn,"","");
                $.each(page._detected, function(kd,kditem) {
//console.log(kd,kditem);
                    switch(kd)
                    {
                        case "Tag Managers":
                            addStat(statsList,"Tag Managers","",kditem,"","");
                            break;
                        case "Analytics":
                            addStat(statsList,"Analytics","",kditem,"","");
                            break; 
                        case "CDN":
                            addStat(statsList,"CDN","",kditem,"","");
                            break;
                        case "Advertising Networks":
                            addStat(statsList,"Advertising Networks","",kditem,"","");
                            break;
                        case "JavaScript Frameworks":
                            addStat(statsList,"JavaScript Frameworks","",kditem,"","");
                            break;
                        case "Web Frameworks":
                            addStat(statsList,"Web Frameworks","",kditem,"","");
                            break; 
                    }
                });
                if(page._Images)
                {
                    var json = JSON.parse(page._Images);
//console.log(json);
                    var noofImages = 0;
                    $.each(json, function() {
                        $.each(this, function(k, v) {
                        /// do stuff
                        
                        });
                        noofImages++;
                    });
                    addStat(statsList,"No. of Images","",noofImages,"","");
                }
            }
            else
            {
//console.log("page not matched", page.id);
            }
        }); // end pages
        // display page stats
        $("#pagesummary").append(statsList);

        // get entry stats
        $.each(obj.entries, function(keyEntries,entries) {
// console.log(keyEntries,entries);
            var contentType = entries._contentType;

// console.log("summary",entries.startedDateTime,entries._full_url);



        }); // end entries

    }); // end log
}

function addStat(statsList,headline,strapline,value,suffix,format)
{
    if(!value)
        return;
    var lineHeadline = document.createElement("div");
    lineHeadline.setAttribute("class","statheadline");
    var lineValue = document.createElement("div");
    var txtHeadline = document.createTextNode(headline);
    var txtValue = document.createTextNode(value.toLocaleString('en-gb') + " " + suffix);
    if(txtValue.length < 10)
        lineValue.setAttribute("class","statvalue");
    else
        if(txtValue.length < 16)
            lineValue.setAttribute("class","statvalue statvaluemedium");
        else
        {
            lineValue.setAttribute("class","statvalue statvaluesmall");
        }

    lineHeadline.appendChild(txtHeadline);
    lineValue.appendChild(txtValue);
    li = document.createElement("li");
    statsList.appendChild(li);
    li.appendChild(lineHeadline);
    li.appendChild(lineValue);
}

function parseHarFileObjects()
{
    var tableType = "objects";
    // prepare divs
    $("#detail").append('<div id="' + tableType + '"></div>');
    // define table data
    data = [{"label": "expand","field":"expand","format": "expand"},
        {"label": "Full URL","field":"_full_url","format": "hidden"},
        {"label": "#","field":"_number","format": "n"},
        {"label": "host","field":"_host","format": "t"},
        {"label": "URL","field":"_url","format": "wrap"},
        {"label": "Content Type","field":"_contentType","format": "t"},
        {"label": "Date Time","field":"startedDateTime","format": "t"},
        {"label": "Protocol","field":"_protocol","format": "t"},
        {"label": "Response Code","field":"_responseCode","format": "t"},
        {"label": "Content Encoding","field":"_contentEncoding","format": "t"},
        {"label": "Size (bytes)","field":"_objectSize","format": "n,"},
        {"label": "expand","field":"expand","format": "expand"},
    ];
    // create table header and body
    var header = addTableHeaders(data);
    var body = addTableBody(data,tableType);

    // build table
    var table = document.createElement("table");
    table.setAttribute("id", "tableObjects");
    table.setAttribute("class","cell-border compact stripe");
    table.appendChild(header);
    table.appendChild(body);
    $("#objects").append(table);
    $('#tableObjects').DataTable( {
        "columnDefs": [
            {
                "targets": [ 0 ],
                "orderable": false,
                "searchable": false
            },
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            }
        ],
        "order": [2, "asc"], // sort by object number ascending
        "dom": '<"top"if>rt<"bottom"lp><"clear">',
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
    });

    table = $('#tableObjects').DataTable();
    // Add event listener for opening and closing details
    $('#tableObjects tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( formatObjects(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
}

function parseHarFileHeaders()
{
    var tableType = "headers";
    // prepare divs
    $("#detail").append('<div id="' + tableType + '"></div>');
    // define table data
    data = [{"label": "expand","field":"expand","format": "expand"},
        {"label": "Full URL","field":"_full_url","format": "hidden"},
        {"label": "#","field":"_number","format": "n"},
        {"label": "host","field":"_host","format": "t"},
        {"label": "URL","field":"_url","format": "wrap"},
    ];
    subdata = [{"label": "Status","field":"status","format": "t"},
    {"label": "Server","field":"server","format": "t"},
    {"label": "Date","field":"date","format": "date"},
    {"label": "Content Type","field":"content-type","format": "t"},
    {"label": "Content Encoding","field":"content-encoding","format": "t"},
    {"label": "Content Length (bytes)","field":"content-length","format": "n,"},
    {"label": "Vary","field":"vary","format": "t"},
    {"label": "Transfer Encoding","field":"transfer-encoding","format": "t"},
    {"label": "Connection","field":"connection","format": "t"},
    {"label": "Keep Alive","field":"keep-alive","format": "t"},
    {"label": "Last Modified","field":"last-modified","format": "t","tooltip":"date-ago"},
    {"label": "Expires","field":"expires","format": "t","tooltip":"date-in"},
    {"label": "Pragma","field":"pragma","format": "t"},
    {"label": "Cache-Control","field":"cache-control","format": "t","tooltip": "max-age"},
    {"label": "Etag","field":"etag","format": "t"},
    {"label": "xserver","field":"xserver","format": "t"},
    {"label": "X-Served By","field":"x-served-by","format": "t"},
    {"label": "X-Cache","field":"x-cache","format": "t"},
    {"label": "X-C","field":"x-c","format": "t"},
    {"label": "X-Px","field":"x-px","format": "t"},
    {"label": "X-Edge-Location","field":"x-edge-location","format": "t"},
    {"label": "CF-RAY","field":"cf-ray","format": "t"},
    {"label": "X-CDN-Geo","field":"x-cdn-geo","format": "t"},
    {"label": "X-CDN","field":"x-cdn","format": "t"},
    {"label": "CF-Cache-Status","field":"cf-cache-status","format": "t"},
    {"label": "Set Cookie","field":"set-cookie","format": "br"},
    {"label": "expand","field":"expand","format": "expand"},
    ];
    // create table header and body
    var header = addTableHeaders(data,subdata); //
    var body = addTableBody(data,tableType,"response.headers", subdata); //

    // build table
    var table = document.createElement("table");
    table.setAttribute("id", "tableHeaders");
    table.setAttribute("class","cell-border compact stripe");
    table.appendChild(header);
    table.appendChild(body);
    $("#headers").append(table);
    $('#tableHeaders').DataTable( {
        "columnDefs": [
            {
                "targets": [ 0 ],
                "orderable": false,
                "searchable": false
            },
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            }
        ],
        "order": [1, "asc"], // sort by object number ascending
        "dom": '<"top"if>rt<"bottom"lp><"clear">',
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
    });
    table.appendChild(body);

    table = $('#tableHeaders').DataTable();
    // Add event listener for opening and closing details
    $('#tableHeaders tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( formatHeaders(row.data()) ).show();
            tr.addClass('shown');
        }
    } );

}


function parseHarFileImages()
{
    var tableType = "images";
    // prepare divs
    $("#detail").append('<div id="' + tableType + '"></div>');
    // define table data
    data = [{"label": "expand","field":"expand","format": "expand"},
        {"label": "Full URL","field":"_full_url","format": "hidden"},
        {"label": "#","field":"_number","format": "n"},
        {"label": "host","field":"_host","format": "t"},
        {"label": "URL","field":"_url","format": "wrap"},
        {"label": "Content Type","field":"_contentType","format": "t"},
        {"label": "Format", "pfield":"format" },
        {"label": "Encoding", "pfield":"encoding" },
        {"label": "Size (bytes)","field":"_objectSize","format": "n,"},
        {"label": "Metadata Size (bytes)", "pfield":"metadatabytes" },
        {"label": "JFIF (bytes)", "pfield":"jfifbytes" },
        {"label": "EXIF (bytes)", "pfield":"exifbytes" },
        {"label": "ICC Colour Profile (bytes)", "pfield":"iccbytes" },
        {"label": "XMP (bytes)", "pfield":"xmpbytes" },
        {"label": "Comment (bytes)", "pfield":"commentbytes" },
        {"label": "PhotoShop Ducky Tag (bytes)", "pfield":"psducky" },
        {"label": "PhotoShop Tags (bytes)", "pfield":"pstags" },
        {"label": "PhotoShop Quality", "pfield":"pshopq" },
        {"label": "Esimated JPEG Quality", "pfield":"jpegq" },
        {"label": "GIF Animiation Frame Count", "pfield":"framecount" },
        {"label": "expand","field":"expand","format": "expand"},
    ];
    // create table header and body
    var header = addTableHeaders(data);
    var body = addTableBody(data,tableType);

    // build table
    var table = document.createElement("table");
    table.setAttribute("id", "tableImages");
    table.setAttribute("class","cell-border compact stripe");
    table.appendChild(header);
    table.appendChild(body);
    $("#images").append(table);
    $('#tableImages').DataTable( {
        "columnDefs": [
            {
                "targets": [ 0 ],
                "orderable": false,
                "searchable": false
            },
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
                "visible": true,
                "searchable": true
            }
        ],
        "order": [7, "desc"], // sort by byte size descending
        "dom": '<"top"if>rt<"bottom"lp><"clear">',
        "iDisplayLength": 10,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "autoWidth": false
    } );

    table = $('#tableImages').DataTable();
    // Add event listener for opening and closing details
    $('#tableImages tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( formatImages(row.data()) ).show();
            tr.addClass('shown');
        }
    } );

    // read through table, call exiftool and update metadata information
    extractImageMetadata();
    //console.log(metadata);

    // add view images buttons
    var buttonMetaData = document.createElement("button");
    var buttonView = document.createElement("button");
    var buttonViewNone = document.createElement("button");
    buttonMetaData.value = "Get Metadata";
    buttonMetaData.setAttribute("id", "metadata");
    buttonMetaData.appendChild(document.createTextNode("Read Metadata"));
    buttonView.value = "View";
    buttonView.setAttribute("id", "viewimages");
    buttonView.appendChild(document.createTextNode("View"));
    buttonViewNone.value = "Hide";
    buttonViewNone.setAttribute("id", "unviewimages");
    buttonViewNone.appendChild(document.createTextNode("Hide"));
    $("#images").append('<div id="viewbuttons"></div>');
    $("#viewbuttons").append(buttonMetaData);
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
    buttonMetaData.onclick = function() {
        extractImageMetadata();
    };

    $('#tableImages').on( 'page.dt', function () {
        extractImageMetadata();
        // var info = table.page.info();
        // $('#pageInfo').html( 'Showing page: '+info.page+' of '+info.pages );
    } );
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
    
    table.rows({search:'applied', page: 'current'}).every( function () {
        var d = this.data();
    
//console.log(d[0],d[6],parseInt(d[6].replace(/,/g, '')));
    var filename = getFileName(d[3]);
    var filesize = d[8];

    if(parseInt(filesize.replace(/,/g, '')) > 44) // ignore tracking pixels less than 45 bytes
    {
        var imagetoview = document.createElement("figure");
        imagetoview.setAttribute("id", "image_" + d[2]);
        $('#imagesview').append($(imagetoview));
        $('#image_'+ d[2]).append($('<img>',{id:'theImg_'+ d[2],src:d[1],class: 'displayedimage'}));
        $('#image_'+ d[2]).append($('<figcaption>' + filename + ' (' + filesize.toLocaleString('en-GB') + ' bytes)' + '</figcaption>'));
        //$('#imagesview').append($(imagetoview));
        
    }
    })
        // toggle background to figures
        $(".displayedimage").click(function () {
            $(this).toggleClass("green");
         });
}

function extractImageMetadata()
{
    var table = $('#tableImages').DataTable();
    $('#imagesview').empty(); 
    
    table.rows({order:'index', search:'applied', page: 'current'}).every( function () {
        var d = this.data();
    
//console.log(d[1],d[0],d[5],parseInt(d[5].replace(/,/g, '')));
        var filename = getFileName(d[1]);
        var filepath = d[1];
        var filenumber = d[2];
        var mdb = d[9];

        if(mdb == "unread")
        {
        // get image from server
        
        // Assign handlers immediately after making the request,
        // and remember the jqXHR object for this request
        $.ajax({
            url: "xhr_extract_image_metadata.php", 
            type: "POST",
            data: { jn: jobnumber, fp : filepath, fn: filename, no: filenumber }
        })
        .done(function(mdata) {
//console.log(mdata);
            // update table with image metadata
            var rowid = mdata.no.toString();
            // update table using fnupdate
            $('#tableImages').dataTable().fnUpdate(mdata.mimeType, $('[data-id=' + rowid + ']'),5,false); // mime type 
            $('#tableImages').dataTable().fnUpdate(mdata.version, $('[data-id=' + rowid + ']'),6,false); // format version 
            $('#tableImages').dataTable().fnUpdate(mdata.encoding, $('[data-id=' + rowid + ']'),7,false); // encoding
            // 8 is file size in bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.metadatabytes), $('[data-id=' + rowid + ']'),9,false); // metadata bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app0jfifbytes), $('[data-id=' + rowid + ']'),10,false); // jfif bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app1exifbytes), $('[data-id=' + rowid + ']'),11,false); // exif bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app2iccbytes), $('[data-id=' + rowid + ']'),12,false); // icc bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.xmpbytes), $('[data-id=' + rowid + ']'),13,false); // xmp bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.commentbytes), $('[data-id=' + rowid + ']'),14,false); // comment bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app12bytes), $('[data-id=' + rowid + ']'),15,false); // app12 ducky tag bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app13bytes), $('[data-id=' + rowid + ']'),16,false); // app13 photoshop bytes
            if(mdata.type == "JPEG" && mdata.duckyquality > 0)
                $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.duckyquality) + "%", $('[data-id=' + rowid + ']'),17,false); // photoshop quality
            else
                $('#tableImages').dataTable().fnUpdate( "", $('[data-id=' + rowid + ']'),17,false); // photoshop quality not defined
            if(mdata.type == "JPEG")
                $('#tableImages').dataTable().fnUpdate(mdata.jpegestquality, $('[data-id=' + rowid + ']'),18,false); // photoshop quality
            else
                $('#tableImages').dataTable().fnUpdate( "", $('[data-id=' + rowid + ']'),18,false); // esimated quality not defined
            if(mdata.type == "GIF" && mdata.gifframecount > 0)
                $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.gifframecount), $('[data-id=' + rowid + ']'),19,false); // gif animation frames
            else
                $('#tableImages').dataTable().fnUpdate( "", $('[data-id=' + rowid + ']'),19,false); // gif animation frames not defined

        })
        .fail(function(xhr, textStatus, errorThrown) {
            console.log( "error processing image " + filename );
            console.log('STATUS: '+textStatus+'\nERROR THROWN: '+errorThrown);
        })
        .always(function() {
        //alert( "complete" );
        });
    }
    }); 
    
}

function addTableHeaders(data,subdata = '')
{
    //Add a header
    var header = document.createElement("thead");
    var headerrow = document.createElement("tr");

    // define header columns
    $.each(data, function(i, item) {
//console.log(item.label,item.field);
        var headerCell = document.createElement("th");
        if(item.format != "expand")
            headerCell.appendChild(document.createTextNode(item.label));
        else
        {
            // skip a row-expansion column
        }
        headerrow.appendChild(headerCell);
    });

    if(subdata)
    {
        $.each(subdata, function(i, item) {
            //console.log(item.label,item.field);
                    var headerCell = document.createElement("th");
                    headerCell.appendChild(document.createTextNode(item.label));
                    headerrow.appendChild(headerCell);
                });
    }

    // append header to table
    header.appendChild(headerrow);
    
    return header;
}

function addTableBody(data,cType,subDataType = '',subdata = '')
{
    // create arrays of data content types
    var arrayImageContentTypes = ["image/jpeg","image/gif", "image/webp", "image/bmp", "image/x-icon", "image/png"];
    var arrayJavaScriptContentTypes = ["application/javascript","application/x-javascript","text/javascript"];

    // copy the required array of data content types
    var cloneContentTypes = '';
    switch(cType)
    {
        case "images":
            cloneContentTypes = arrayImageContentTypes.slice(0);
            break;
        case "javascript":
            cloneContentTypes = arrayJavaScriptContentTypes.slice(0);
            break;
        case "all":
            break;
    }

    var body = document.createElement("tbody");

//console.log(harFile);
        $.each(harFile, function(key,obj) {
    //     $.each(obj.pages, function(keyPages,page) {
    //         if (page.id == selPageID)
    //         {
    // //console.log("page matched", page.id);
    //             // extract page summary information
    // //console.log(page); 
    //         }
    //     }); // end pages

        
            var respsonsedatetime = '';
            $.each(obj.entries, function(keyEntries,entry) {
                if (entry.pageref == selPageID)
                {
//console.log("entry and page matched", entry.pageref);
                    if(cloneContentTypes.length == 0 || cloneContentTypes.indexOf(entry._contentType) != -1)
                    {
                        respsonsedatetime = entry.startedDateTime;
//console.log("keyentry",keyEntries,entry);
                        var tr = document.createElement("tr");
                        // define data column values
                        $.each(data, function(i, item) {                          
//console.log("body data",item.label,item.field);
                            var rowCell = document.createElement("td");
                            var tooltip = '';
                            var field = '';
                            if(item.field)
                                field = "entry." + item.field;
                            else
                                field = '';
                            var prefix = '';
                            var suffix = '';
                            
                            if(!item.field){
                                // prep for missing field
                                var pid = "unread";
                                
                                rowCell.setAttribute("id",entry._number + item.pfield);
                                rowCell.appendChild(document.createTextNode(pid));
                            }
                            else
                            {
                                switch(item.format)
                                {
                                    case "n,": // numeric with thousands separator
                                        field += ".toLocaleString('en-GB')";
                                        break;
                                    case "br":
    //console.log("data formatting adding break",item.field);
                                        suffix = "<br/>";
                                        break;
                                }

                                switch(item.tooltip)
                                {
                                    default:
                                        tooltip = item.label;
                                }
                                rowCell.setAttribute("title",tooltip);
                                tr.setAttribute("data-id",entry._number);
    //console.log("field",field);
                                switch(item.format)
                                {
                                    case"expand":
                                        rowCell.setAttribute("class", "details-control");
                                        break;
                                    case  "wrap":
                                        var wrapDiv = document.createElement("div");
                                        wrapDiv.setAttribute("class", "wrap");
                                        wrapDiv.appendChild(document.createTextNode(prefix + eval(field) + suffix));
                                        rowCell.appendChild(wrapDiv);
                                        break;
                                    default:
                                        rowCell.appendChild(document.createTextNode(prefix + eval(field) + suffix));
                                        break;
                                }
                            }
                            tr.appendChild(rowCell);
//console.log("appending data rowcell to row");
                        });

                        // deal with any subdata
                        if(subDataType != '')
                        {
//console.log("processing entry subdata for " + subDataType);

                                $.each(subdata, function(sd, sditem) {
//console.log("checking subdata",sd, sditem);
                    
                                    var dataToFind = sditem.field;
                                    var found = false;
                                    var rowCell = document.createElement("td");
                                    var tooltip = '';
                                    prefix = '';
                                    suffix = ''
                                    var paraHTML = '';
                                    
                                    // iterate through each of the subdatatypes and headers
                                    $.each(eval("entry." + subDataType), function(sdata, sdataitem) {
//console.log(sdata, sdataitem);

                                        field = sdataitem.value;

                                        paraHTML = '';
                                        prefix = '';
                                        suffix = '';

                                        if(sdataitem.name.toLowerCase() == dataToFind)
                                        {
                                            found = true;
                                            switch(sditem.tooltip)
                                            {
                                                case "max-age":
                                                    // get max-age value from field
// console.log("getting max-age value from " + field);
                                                    var maxagePos = field.indexOf("max-age");
                                                    if(maxagePos != -1)
                                                    {
                                                        var maxageStr = field.substring(maxagePos+8);
                                                        tooltip = sditem.label + " " + convertSeconds(maxageStr);
                                                    }
                                                    else
                                                        tooltip = sditem.label;
                                                    break;
                                                case "date-ago":
                                                    var today = new Date(respsonsedatetime);
                                                    var past = new Date(field);
                                                    tooltip = sditem.label + " " + getNiceTime(past, today, 5, 'ago');
                                                    break;
                                                case "date-in":
                                                    var today = new Date(respsonsedatetime);
                                                    var future = new Date(field);
                                                    if(future >= today)
                                                        tooltip = sditem.label + " in " + getNiceTime(future, today, 5, '');
                                                    else
                                                    tooltip = sditem.label + " " + getNiceTime(future, today, 5, 'ago');
                                                    break;
                                                default:
                                                    tooltip = sditem.label;
                                            }
                                            rowCell.setAttribute("title",tooltip);

                                            switch(sditem.format)
                                            {
                                                case "n,": // numeric with thousands separator
                                                    field = formatNumber(field);
                                                    break;
                                                case "br":
    //console.log("subdata formatting adding break",field);
                                                    paraHTML = "break";
                                                    break;
                                            }


//console.log("found",sdata, sdataitem);

                                            if(paraHTML == "break")
                                            {
//console.log("subdata formatting adding break",field);
                                                var para = document.createElement("P");
                                                var t = document.createTextNode(prefix + field + suffix);
                                                para.appendChild(t);
                                                rowCell.appendChild(para)
                                            }
                                            else
                                                rowCell.appendChild(document.createTextNode(prefix + field + suffix));
                        
                                        }
                                    });
                                    if(found == false)
                                    {
                                        switch(sditem.label)
                                        {
                                            case"expand":
                                                rowCell.setAttribute("class", "details-control");
                                                break;

                                        // override if required
//                                             case "Status":
// //console.log(status,eval(entry.response.status));
//                                                 rowCell.appendChild(document.createTextNode(eval(entry.response.status)));
//                                                 break;
//                                             case "Content Length (bytes)":
//                                                 rowCell.appendChild(document.createTextNode(formatNumber(eval(entry.response.bodySize))));
//                                                 break;
                                            default:
                                            rowCell.appendChild(document.createTextNode("-"));
                                        }
                                        
                                    }
//console.log("appending subdata rowcell to row");
                                    tr.appendChild(rowCell);
                                });

                        }
                        // append row to body
                        body.appendChild(tr);
//console.log("appending row to body");
                    }
                }
            }); // end entries
        }); // end log

    return body;
}

/////////////////////////
// utility functions
function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}
function convertSeconds(seconds) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var numdays = Math.floor(sec_num / 86400);
    var numhours = Math.floor((sec_num % 86400) / 3600);
    var numminutes = Math.floor(((sec_num % 86400) % 3600) / 60);
    var numseconds = ((seconds % 86400) % 3600) % 60;
    if (numhours < 10) { numhours = "0" + numhours; }
    if (numminutes < 10) { numminutes = "0" + numminutes; }
    if (numseconds < 10) { numseconds = "0" + numseconds; }
    return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
}

function returnNumFromString(str) { 
    var num = str.replace(/[^0-9]/g, ''); 
    return parseInt(num,10); 
}

/**
 * Function to print date diffs.
 *
 * @param {Date} fromDate: The valid start date
 * @param {Date} toDate: The end date. Can be null (if so the function uses "now").
 * @param {Number} levels: The number of details you want to get out (1="in 2 Months",2="in 2 Months, 20 Days",...)
 * @param {Boolean} prefix: adds "in" or "ago" to the return string
 * @return {String} Difference between the two dates.
 */
function getNiceTime(fromDate, toDate, levels, prefix) {
    var lang = {
        "date.past": "{0} ago",
        "date.future": "in {0}",
        "date.now": "now",
        "date.year": "{0} year",
        "date.years": "{0} years",
        "date.years.prefixed": "{0} years",
        "date.month": "{0} month",
        "date.months": "{0} months",
        "date.months.prefixed": "{0} months",
        "date.day": "{0} day",
        "date.days": "{0} days",
        "date.days.prefixed": "{0} days",
        "date.hour": "{0} hour",
        "date.hours": "{0} hours",
        "date.hours.prefixed": "{0} hours",
        "date.minute": "{0} minute",
        "date.minutes": "{0} minutes",
        "date.minutes.prefixed": "{0} minutes",
        "date.second": "{0} second",
        "date.seconds": "{0} seconds",
        "date.seconds.prefixed": "{0} seconds",
    },
        langFn = function (id, params) {
            var returnValue = lang[id] || "";
            if (params) {
                for (var i = 0; i < params.length; i++) {
                    returnValue = returnValue.replace("{" + i + "}", params[i]);
                }
            }
            return returnValue;
        },
        toDate = toDate ? toDate : new Date(),
        diff = fromDate - toDate,
        past = diff < 0 ? true : false,
        diff = diff < 0 ? diff * -1 : diff,
        date = new Date(new Date(1970, 0, 1, 0).getTime() + diff),
        returnString = '',
        count = 0,
        years = (date.getFullYear() - 1970);
    if (years > 0) {
        var langSingle = "date.year" + (prefix ? "" : ""),
            langMultiple = "date.years" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (years > 1 ? langFn(langMultiple, [years]) : langFn(langSingle, [years]));
        count++;
    }
    var months = date.getMonth();
    if (count < levels && months > 0) {
        var langSingle = "date.month" + (prefix ? "" : ""),
            langMultiple = "date.months" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (months > 1 ? langFn(langMultiple, [months]) : langFn(langSingle, [months]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var days = date.getDate() - 1;
    if (count < levels && days > 0) {
        var langSingle = "date.day" + (prefix ? "" : ""),
            langMultiple = "date.days" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (days > 1 ? langFn(langMultiple, [days]) : langFn(langSingle, [days]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var hours = date.getHours();
    if (count < levels && hours > 0) {
        var langSingle = "date.hour" + (prefix ? "" : ""),
            langMultiple = "date.hours" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (hours > 1 ? langFn(langMultiple, [hours]) : langFn(langSingle, [hours]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var minutes = date.getMinutes();
    if (count < levels && minutes > 0) {
        var langSingle = "date.minute" + (prefix ? "" : ""),
            langMultiple = "date.minutes" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (minutes > 1 ? langFn(langMultiple, [minutes]) : langFn(langSingle, [minutes]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var seconds = date.getSeconds();
    if (count < levels && seconds > 0) {
        var langSingle = "date.second" + (prefix ? "" : ""),
            langMultiple = "date.seconds" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (seconds > 1 ? langFn(langMultiple, [seconds]) : langFn(langSingle, [seconds]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    if (prefix) {
        if (returnString == "") {
            returnString = langFn("date.now");
        } else if (past)
            returnString = langFn("date.past", [returnString]);
        else
            returnString = langFn("date.future", [returnString]);
    }
    return returnString;
}

function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

/* Formatting function for row details - modify as you need */
function formatObjects ( d ) {
    // `d` is the original data object for the row
    var objecttable = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Full URL:</td>'+
            '<td>'+d[1]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Size (bytes):</td>'+
            '<td>'+d[10]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Extra info:</td>'+
            '<td>And any further details here (images etc)...</td>'+
        '</tr>'+
    '</table>';

    return objecttable;
}

function formatHeaders ( d ) {
    // `d` is the original data object for the row
    // get request and headers for the object
    var hdrs = getHeaders(d[2]);
console.log(hdrs[0]);
console.log(hdrs[1]);
    // request headers
    var areqheaders = [];
    var reqheaders = '';
    $.each( hdrs[0], function( krq, rqvalue ) {
        console.log( rqvalue.name + ": " + rqvalue.value );
        areqheaders.push (rqvalue.name + ": " + rqvalue.value);
    });
    reqheaders = areqheaders.join('</br>');
    // response headers
    var arspheaders = [];
    var rspheaders = '';

    $.each( hdrs[1], function( krs, rsvalue ) {
        console.log( krs + ": " + rsvalue.name + " " + rsvalue.value );
        arspheaders.push (rsvalue.name + ": " + rsvalue.value);
    });
    rspheaders = arspheaders.join('</br>');

var hdrtable = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Full URL:</td>'+
            '<td>'+d[1]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Size (bytes):</td>'+
            '<td>'+d[10]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Request Headers</td>'+
            '<td>' + reqheaders + '</td>'+
        '</tr>'+
        '<tr>'+
        '<td>Response Headers</td>'+
        '<td>' + rspheaders + '</td>'+
    '</tr>'+
    '</table>';
    
    return hdrtable
}

function formatImages ( d ) {
    // `d` is the original data object for the row
    var filename = getFileName(d[1]);
    var filepath = d[1];
    var filenumber = d[2];
    var mdb = d[9];
    //get metadata structure
    $.ajax({
        url: "xhr_get_image_structure.php", 
        type: "POST",
        data: { jn: jobnumber, fp : filepath, fn: filename, no: filenumber }
    })
    .done(function(imgdata) {
//console.log("format images",imgdata);
        textStructure = imgdata.structure;
//console.log("adding structure", "#imgstr_" + filenumber, textStructure)
        $("#imgstr_" + filenumber).html("<pre>" + textStructure + "</pre>");
        if(imgdata.roastpath_tnexif != '')
            $("#imgtn_" + filenumber).html('<img id="theImgTN" src="' + imgdata.roastpath_tnexif +  '"></>')
        else
            $("#imgtn_" + filenumber).parent("tr").remove();
        if(imgdata.roastpath_tnps != '')
            $("#imgtnps_" + filenumber).html('<img id="theImgTNPS" src="' + imgdata.roastpath_tnps +  '"></>')
        else
            $("#imgtnps_" + filenumber).parent("tr").remove();;
        $("#img_" + filenumber).html('<img id="theImg" src="' + imgdata.roastpath +  '"></>')


    })
    .fail(function() {
//console.log( "error getting image structure " + filename );
    })
    .always(function() {
//alert( "complete" );
    });


    var imagetable = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Full URL:</td>'+
            '<td>'+d[1]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Size (bytes):</td>'+
            '<td>'+d[8]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Structure:</td>'+
            '<td id="imgstr_' + filenumber + '"></td>'+
        '</tr>'+
        '<tr>'+
        '<td>Exif Image Thumbnail:</td>'+
        '<td id="imgtn_' + filenumber + '"></td>'+
    '</tr>'+
        '<tr>'+
        '<td>PhotoShop Image Thumbnail:</td>'+
        '<td id="imgtnps_' + filenumber + '"></td>'+
    '</tr>'+
        '<tr>'+
        '<td>Image:</td>'+
        '<td id="img_' + filenumber + '"></td>'+
    '</tr>'+
    '</table>';

    return imagetable;
}

function getHeaders(no)
{
//console.log(harFile);
var rdata = [];
$.each(harFile, function(key,obj) {
    //     $.each(obj.pages, function(keyPages,page) {
    //         if (page.id == selPageID)
    //         {
    // //console.log("page matched", page.id);
    //             // extract page summary information
    // //console.log(page); 
    //         }
    //     }); // end pages


    var reqhdrs = {};
    var rsphdrs = {};
            var respsonsedatetime = '';
            $.each(obj.entries, function(keyEntries,entry) {
                if (entry.pageref == selPageID && entry._number == no)
                {
//console.log("get headers", entry._url);
                    reqhdrs = entry.request.headers;
                    rsphdrs = entry.response.headers;
                    rdata.push(reqhdrs);
                    rdata.push(rsphdrs);
                }
            });
        });
//console.log(rdata);
        return rdata;
}