# Import Processor Required 
## .name
Exposes a human-readable name for this processor. Like "You Tube" or "Vimeo"
## .handle
Exposes an internal handle for matching videos to processors. must be one word, lowercase, shorter is better, but this cannot be changes once videos start using it, without annoying db updates.
## .matches
A array of regex **strings** to be used to match against potential video imports when selecting which processor to use. This match is __not__ to extract the video id from the url or any other data, that will occur in the getVideo() function below. These matches are simply used to check if a url is the kind this processor is supposed to take. For example

* `['http[s]{0,1}.*youtube.com\/watch\?v=.+','http[s]{0,1}.*youtu.be\/.+'] // Matches for Youtube links.`
* `['http[s]{0,1}.*vimeo.com\/.+'] // Matches for Vimeo links.`

## .getVideo(url, callback)
Called by the importer when this processor has been selected based on the matching rules. This should perform whatever tasks needed to create a new Video() object based on the provided url string, and then invoke callback(err, video) when complete.