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
WebPage Roaster - Results Optimisation and Analysis from a WebPageTest result link

This is the start of a new project to take a set of WPT results and display additional analysis in the form of tables and charts.

Initial work focusses upon identifying and allowing selection of any page test result within the WPT job. For a scripted test of 5 steps and 3 runs, this would be 15 pages.

With a page selected, the work begins to display the data including the following:
- summmary of key metrics and stats.
- JavaScript analysis
- CSS analysis
- font analysis
- image analysis (metadata, quality) and image optimisation
- third party analysis
- domain and network analysis
- response header analysis
- caching header analysis

# Development Approach
agile and evolutionary... write a bit, test a bit and repeat.

# Frameworks and Libraries used
- jQuery 3.3.1
- jQuery Datatables
