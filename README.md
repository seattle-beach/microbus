[![Build Status](https://travis-ci.org/seattle-beach/weatherbus-web.svg?branch=master)](https://travis-ci.org/seattle-beach/weatherbus-web)

Setup Instructions 

1. Build the app
    1. Run `bundle install`.
    2. Install Node modules: `npm install --dedupe jshint babel babel-cli babel-preset-es2015`
    3. If you intend to use any of the Google Maps features, specify the API key: `export WB_MAPS_API_KEY=<the key>`.
    4. Run `rake`. Or, to run against a local Weatherbus instance, run `rake build['dev'] unitTests`.
    5. You should not see any errors.

2. Launch the app
    1. `$ rake server`
    1. Open 'http://localhost:4567'

3. Clone, set up, and launch weatherbus
    1. See <https://github.com/gbcm/weatherbus> and follow the directions there.
    2. Currently, need to disable CORS for local development by adding the following code to the UserController class:

    ```java
    @ModelAttribute
    public void setVaryResponseHeader(HttpServletResponse response) {
      response.setHeader("Access-Control-Allow-Origin", "*");
    }
    ```

4. Create a Weatherbus user and some stops
    1. Change to the weatherbus repo from step 3 above.
    2. Create a user by running `tools/adduser bob`.
    3. Add a stop by running `tools/addstop bob <a real stop ID, e.g. 1_75403>`.
    4. Verify the setup by running `tools/getstops bob`.

5. Log in to the web front end as the newly created user
    1. If it's not still open, open [file://&lt;repo root&gt;/target/index.html]()
    2. Log in as bob.
    3. You should see the stop that was created in the previous step.


Other things you can do:

* Run the Jasmine test in a browser
    1. Run `rake jasmine` and go to the URL mentioned in the output.
    2. Everything should be green.
