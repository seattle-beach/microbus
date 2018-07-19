Setup Instructions 

1. Build the app
    1. Run `bundle install`.
    1. Install Node modules: `npm install --dedupe jshint babel babel-cli babel-preset-es2015`
    2. Obtain a Google Maps API key and store it in an environment variable: `export WB_MAPS_API_KEY=<the key>`.
	 3. Run `rake` to build.
    4. You should not see any errors.

2. Launch the app
    1. Open public/index.html in a browser.


Other things you can do:

* Run the Jasmine test in a browser
    1. Run `rake jasmine` and go to the URL mentioned in the output.
    2. Everything should be green.

* Deploy to Cloud Foundry
	1. `$ cf login`
	2. `$ rake deploy`
