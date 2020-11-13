# Youtube Microservice

### Available API Routes

* [/api/barnetrss](/api/barnetrss) - Youtube RSS filtered to Barnet Libraries videos only
* [/api/getStats](/api/getStats) - Just the current numbers from YouTube - no database update
* [/api/currentTotal](/api/currentTotal) - Just the current total from YouTube - no database update
*  [/api/insertStats](/api/insertStats) - Gets the current numbers from YouTube and inserts them, then returns the whole stats table.
*  [/api/totals](/api/totals) - Updates the stats table with current stats, and returns historic views and number of videos
*  [/api/videos](/api/videos) - Returns the videos table from sqlite database
*  [/api/insertVids](/api/insertVids) - ?ids=comma,seperated,list of ids to insert videos by id
*  [/api/audienceType](/api/audienceType) - returns an array of vidIds with the playlist title and audience