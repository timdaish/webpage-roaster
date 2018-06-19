// TD RA Javascript
var harFile = '';

// button options
$( "#sbm" ).click(function() {
    // clear results divs
    clearDivs(true,true);
//alert( "Handler for .click() called." );
    var wptlink = $('#wptlink').val();
    var test = getWPTResultsID(wptlink);
console.log ("server", test.serverpath);
console.log ("testid", test.testid);
    harFile = getWPTResultsHarFile(test.serverpath, test.testid);
});

$( "#optSummary" ).click(function() {
    // clear results divs
    clearDivs(true,true);
    parseHarFileSummary(harFile)
});    

$( "#optHeaders" ).click(function() {
    // clear results divs
    clearDivs(false,true);
    parseHarFileHeaders(harFile)
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
        parseHarFileSummary(harFile);
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

function parseHarFileSummary(harFile)
{
    var noofPages = 0;
    var noofSteps = 0;
    var noofRuns = 0;
    // prepare divs
    $("summary").append('<div id="test"></div>');
    
  console.log(harFile);
    $.each(harFile, function(key,obj) {
//console.log(key,obj);
        console.log(obj.version,obj.browser.name,obj.browser.version);
        $("#summary").append("Browser: " + obj.browser.name + " " + obj.browser.version + "<br/>");
        $.each(obj.pages, function(keyPages,page) {
            console.log(keyPages,page);
            noofPages++;
            if(page._run > noofRuns)
                noofRuns = page._run;
                if(page._step > noofSteps)
                noofSteps = page._step;
            // append to dropdown
            $("#selPages").append($('<option></option>').val(page.id).html(page._URL));
        }); // end pages
        $("#summary").append('Number of Pages Tested: ' + noofPages + "<br/>");
        $("#summary").append('Number of Steps: ' + noofSteps + "<br/>");
        $("#summary").append('Number of Runs: ' + noofRuns + "<br/>");

        $.each(obj.entries, function(keyEntries,entries) {
            console.log(keyEntries,entries);
            var contentTye = entries._contentType;

           // console.log("summary",entries.startedDateTime,entries._full_url);



        }); // end entries

    }); // end log
}

function parseHarFileHeaders(harFile)
{
    // prepare divs
    $("detail").append('<div id="tableHeaders"></div>');

    //  console.log(harFile);
    $.each(harFile, function(key,obj) {
        $.each(obj.pages, function(keyPages,pages) {
            console.log(keyPages,pages);
            noofPages++;
        }); // end pages

        $.each(obj.entries, function(keyEntries,entries) {
            console.log(keyEntries,entries);
            var contentTye = entries._contentType;

            // console.log("headers",entries.startedDateTime,entries._full_url);



        }); // end entries

    }); // end log   
}
// switch(mode)
// {
//     case "objects":
//         console.log("object",entries.startedDateTime,entries._full_url);
//         $("#detail").append(entries.startedDateTime + " " + entries._full_url +"<br/>");
//         break;
//     case "thirdparties":
//         console.log("thirdparties",entries.startedDateTime,entries._full_url);
//         break;
// }