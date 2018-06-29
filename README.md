  Copyright 2018 Tim Daish BA(Hons) MBCS CTAL-TM

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


# Introduction
WebPage Roaster - Advanced Results Optimisation and Analysis from a WebPageTest (WPT) result link

This is the start of a new project to take a set of WPT results and display additional analysis in the form of tables and charts.

Initial work focusses upon identifying and allowing selection of any page test result within the WPT job. For a scripted test of 5 steps and 3 runs, this would be 15 pages.

With a page selected, the work begins to display the data including the following:
- summmary of key metrics and stats.
-- basic info shown
- image analysis (metadata, quality) and image optimisation
-- detailed info shown for image metadata and quality
- JavaScript analysis
-- not available yet
- CSS analysis
-- not available yet
- font analysis
-- not available yet
- third party analysis
-- not available yet
- domain and network analysis
-- not available yet
- response header analysis
-- basic info shown
- caching header analysis
-- not available yet

# Development Approach
Agile and evolutionary... write a bit, test a bit and repeat.

# Frameworks and Libraries used
- jQuery 3.3.1
- jQuery Datatables
- ExifTool
- FontAwesome - but this will be replaced as it has too many icons

# Data Privacy
A few items of data are recorded for statistical purposes. This includes the user's IP address, the name of the WPT server from which a test result is being read and the test ID itself. Details will not be used for anything other than statistical analysis. Data is stored on the Webpage Roaster servers hosted in the UK (TSOHost cloud service).
