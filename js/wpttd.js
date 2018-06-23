// Webpage Roaster - Javascript
// Tim Daish, 2018
var harFile = '';
var selPageID = 'page_1_0_1';
var displaySection = 'summary';
var jobnumber = '';;

// button options
$( "#sbm" ).click(function() {
    // clear results divs
    clearDivs(true,true,true);
//alert( "Handler for .click() called." );
    var wptlink = $('#wptlink').val();
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
    clearDivs(false,true,true);
    displaySection = "summary";
    $( "#optSummary" ).addClass( "selected" );
    $( "#optObjects" ).removeClass( "selected" );
    $( "#optHeaders" ).removeClass( "selected" );
    $( "#optImages" ).removeClass( "selected" );
    parseHarFileSummary(harFile);
});    
$( "#optObjects" ).click(function() {
    // clear results divs
    clearDivs(false,true,true);
    displaySection = "objects";
    $( "#optSummary" ).removeClass( "selected" );
    $( "#optObjects" ).addClass( "selected" );
    $( "#optHeaders" ).removeClass( "selected" );
    $( "#optImages" ).removeClass( "selected" );
    parseHarFileObjects();
});
$( "#optHeaders" ).click(function() {
    // clear results divs
    clearDivs(false,true,true);
    displaySection = "headers";
    $( "#optSummary" ).removeClass( "selected" );
    $( "#optObjects" ).removeClass( "selected" );
    $( "#optHeaders" ).addClass( "selected" );
    $( "#optImages" ).removeClass( "selected" );
    parseHarFileHeaders();
});
$( "#optImages" ).click(function() {
    // clear results divs
    clearDivs(false,true,true);
    displaySection = "images";
    $( "#optSummary" ).removeClass( "selected" );
    $( "#optObjects" ).removeClass( "selected" );
    $( "#optHeaders" ).removeClass( "selected" );
    $( "#optImages" ).addClass( "selected" );
    parseHarFileImages();
});
$( "#selPages" ).change(function() {
    //alert( "Handler for .change() called." );
    //var end = this.value;
    clearDivs(false,true,true);
    selPageID = $('#selPages').val();
console.log("selected page id: ", selPageID);
    switch (displaySection)
    {
        case "summary":
            $( "#optSummary" ).addClass( "selected" );
            $( "#optObjects" ).removeClass( "selected" );
            $( "#optHeaders" ).removeClass( "selected" );
            $( "#optImages" ).removeClass( "selected" );
            parseHarFileSummary(harFile)
            break;
        case "objects":
            $( "#optSummary" ).removeClass( "selected" );
            $( "#optObjects" ).addClass( "selected" );
            $( "#optHeaders" ).removeClass( "selected" );
            $( "#optImages" ).removeClass( "selected" );
            parseHarFileObjects()
            break;
        case "headers":
            $( "#optSummary" ).removeClass( "selected" );
            $( "#optObjects" ).removeClass( "selected" );
            $( "#optHeaders" ).addClass( "selected" );
            $( "#optImages" ).removeClass( "selected" );
            parseHarFileHeaders()
            break;
        case "images":
            $( "#optSummary" ).removeClass( "selected" );
            $( "#optObjects" ).removeClass( "selected" );
            $( "#optHeaders" ).removeClass( "selected" );
            $( "#optImages" ).addClass( "selected" );
            parseHarFileImages()
            break;
        }
  });

function clearDivs(job,test,detail)
{
    if(job == true)
    {
        $("#summary").empty();
        $("#selPages").empty();
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
    $( "#optSummary" ).addClass( "selected" );
    $( "#optObjects" ).removeClass( "selected" );
    $( "#optHeaders" ).removeClass( "selected" );
    $( "#optImages" ).removeClass( "selected" );
    
//console.log(harFile);
    $.each(harFile, function(key,obj) {
//console.log(key,obj);
//console.log(obj.version,obj.browser.name,obj.browser.version);
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
//console.log(page);

                // get page stats
                addStat(statsList,"Total Page Size","",formatBytes(page._bytesIn),"","")
                addStat(statsList,"No. of Requests","",page._requests,"","")
                addStat(statsList,"Speed Index","",page._SpeedIndex,"","")
                addStat(statsList,"Render Start","",page.pageTimings._startRender/1000,"s","")
                addStat(statsList,"Base CDN","",page._base_page_cdn,"","");
                $.each(page._detected, function(kd,kditem) {
//console.log(kd,kditem);
                    switch(kd)
                    {
                        case "Tag Managers":
                        addStat(statsList,"Tag Manager","",kditem,"","");
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
    data = [{"label": "Full URL","field":"_full_url","format": "hidden"},
        {"label": "#","field":"_index","format": "n"},
        {"label": "host","field":"_host","format": "t"},
        {"label": "URL","field":"_url","format": "wrap"},
        {"label": "Content Type","field":"_contentType","format": "t"},
        {"label": "Date Time","field":"startedDateTime","format": "t"},
        {"label": "Protocol","field":"_protocol","format": "t"},
        {"label": "Response Code","field":"_responseCode","format": "t"},
        {"label": "Content Encoding","field":"_contentEncoding","format": "t"},
        {"label": "Size (bytes)","field":"_objectSize","format": "n,"}
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
                "visible": false,
                "searchable": false
            }
        ],
        "order": [1, "asc"], // sort by object number ascending
        "dom": '<"top"if>rt<"bottom"lp><"clear">',
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
    });
}

function parseHarFileHeaders()
{
    var tableType = "headers";
    // prepare divs
    $("#detail").append('<div id="' + tableType + '"></div>');
    // define table data
    data = [{"label": "Full URL","field":"_full_url","format": "hidden"},
        {"label": "#","field":"_index","format": "n"},
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
                "visible": false,
                "searchable": false
            }
        ],
        "order": [1, "asc"], // sort by object number ascending
        "dom": '<"top"if>rt<"bottom"lp><"clear">',
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
    });
    table.appendChild(body);
}


function parseHarFileImages()
{
    var tableType = "images";
    // prepare divs
    $("#detail").append('<div id="' + tableType + '"></div>');
    // define table data
    data = [{"label": "Full URL","field":"_full_url","format": "hidden"},
        {"label": "#","field":"_index","format": "n"},
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
        {"label": "GIF Animiation Frame Count", "pfield":"framecount" },
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
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 1,2,3,4,5,6,7,8,9,10,11,12,13],
                "visible": true,
                "searchable": true
            }
        ],
        "order": [6, "desc"], // sort by byte size descending
        "dom": '<"top"if>rt<"bottom"lp><"clear">',
        "iDisplayLength": 10,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "autoWidth": false
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
    buttonMetaData.appendChild(document.createTextNode("Get Metadata"));
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
    
console.log(d[0],d[6],parseInt(d[6].replace(/,/g, '')));
    var filename = getFileName(d[0]);
    var filesize = d[6];

    if(parseInt(filesize.replace(/,/g, '')) > 44) // ignore tracking pixels less than 45 bytes
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

function extractImageMetadata()
{
    var table = $('#tableImages').DataTable();
    $('#imagesview').empty(); 
    
    table.rows({order:'index', search:'applied', page: 'current'}).every( function () {
        var d = this.data();
    
//console.log(d[1],d[0],d[5],parseInt(d[5].replace(/,/g, '')));
        var filename = getFileName(d[0]);
        var filepath = d[0];
        var filenumber = d[1];
        var mdb = d[7];

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
console.log(mdata);
            // update table with image metadata
            var rowid = mdata.no.toString();
            // update table using fnupdate
            $('#tableImages').dataTable().fnUpdate(mdata.version, $('[data-id=' + rowid + ']'),4,false); // version 
            $('#tableImages').dataTable().fnUpdate(mdata.encoding, $('[data-id=' + rowid + ']'),5,false); // encoding
            // 6 is file size in bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.metadatabytes), $('[data-id=' + rowid + ']'),7,false); // metadata bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app0jfifbytes), $('[data-id=' + rowid + ']'),8,false); // jfif bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app1exifbytes), $('[data-id=' + rowid + ']'),9,false); // exif bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app2iccbytes), $('[data-id=' + rowid + ']'),10,false); // icc bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.xmpbytes), $('[data-id=' + rowid + ']'),11,false); // xmp bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.commentbytes), $('[data-id=' + rowid + ']'),12,false); // comment bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app12bytes), $('[data-id=' + rowid + ']'),13,false); // app12 ducky tag bytes
            $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.app13bytes), $('[data-id=' + rowid + ']'),14,false); // app13 photoshop bytes
            if(mdata.type == "JPEG" && mdata.duckyquality > 0)
                $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.duckyquality) + "%", $('[data-id=' + rowid + ']'),15,false); // photoshop quality
            else
                $('#tableImages').dataTable().fnUpdate( "", $('[data-id=' + rowid + ']'),15,false); // photoshop quality not defined
            if(mdata.type == "GIF" && mdata.gifframecount > 0)
                $('#tableImages').dataTable().fnUpdate(formatNumber(mdata.gifframecount), $('[data-id=' + rowid + ']'),16,false); // gif animation frames
            else
                $('#tableImages').dataTable().fnUpdate( "", $('[data-id=' + rowid + ']'),16,false); // gif animation frames not defined

        })
        .fail(function() {
        //alert( "error processing image " + filename );
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
        headerCell.appendChild(document.createTextNode(item.label));
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

console.log(harFile);
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
                            var field = "entry." + item.field;
                            var prefix = '';
                            var suffix = '';
                            
                            if(!item.field){
                                // prep for missing field
                                var pid = "unread";
                                
                                rowCell.setAttribute("id",entry._index + item.pfield);
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
                                tr.setAttribute("data-id",entry._index);
    //console.log("field",field);
                                if(item.format == "wrap")
                                    {
                                        var wrapDiv = document.createElement("div");
                                        wrapDiv.setAttribute("class", "wrap");
                                        wrapDiv.appendChild(document.createTextNode(prefix + eval(field) + suffix));
                                        rowCell.appendChild(wrapDiv);
                                    }
                                    else
                                        rowCell.appendChild(document.createTextNode(prefix + eval(field) + suffix));
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
                                    // iterate through each of the subdatatypes
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
                                        rowCell.appendChild(document.createTextNode("-"))
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